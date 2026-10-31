import { normalizePagination } from '@common/pagination'
import { PrismaService } from '@infra/prisma/prisma.service'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import { type AuditContextValue, writeTakeDownAudit } from '@modules/admin/shared'
import { RELEASE_ERRORS } from '@modules/releases/errors'
import { ReleasePublishingService } from '@modules/releases/release-publishing.service'
import { type ReleaseReadiness, releaseReadiness } from '@modules/releases/release-readiness'
import { readinessFromRecord, releaseReadinessSelect } from '@modules/releases/releases.select'
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { type Prisma, ReleaseReviewDecision, ReleaseStatus } from '@prisma/client'
import {
  DECIDED_SELECT,
  DETAIL_SELECT,
  type DecidedRelease,
  type DetailRecord,
  REVIEW_SELECT,
  type ReviewRecord,
  ROW_SELECT,
  type RowRecord,
} from './admin-releases.select'
import {
  ADMIN_REVIEWED_STATUSES,
  type ApproveReleaseDto,
  type ListAdminReleasesQueryDto,
  type RequestReleaseChangesDto,
} from './dtos/release-review.dto'

/** What a review decision moves the release to, and the review it stores. */
type DecisionOutcome = {
  status: ReleaseStatus
  review: Omit<Prisma.ReleaseReviewUncheckedCreateInput, 'releaseId' | 'staffId'>
}

/**
 * Bitrate's reviewer side of artist submissions. A decision is only possible on a release
 * still SUBMITTED at the version the reviewer read, so a withdrawn or already-decided release
 * cannot be decided twice; each decision is stored as history and written to the audit log.
 */
@Injectable()
export class AdminReleasesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
    private readonly publishing: ReleasePublishingService,
  ) {}

  async list(query: ListAdminReleasesQueryDto) {
    const { page, limit, skip } = normalizePagination(query.page, query.limit)
    const where = listWhere(query)
    const [rows, total] = await Promise.all([
      this.prisma.release.findMany({
        where,
        select: ROW_SELECT,
        // Oldest submission first, so the queue is worked in arrival order.
        orderBy: [{ submittedAt: { sort: 'asc', nulls: 'last' } }, { id: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.release.count({ where }),
    ])
    return { data: rows.map(toRow), total, page, limit }
  }

  async detail(id: string) {
    const release = await this.prisma.release.findFirst({
      where: { id, deletedAt: null, status: { not: ReleaseStatus.DRAFT } },
      select: DETAIL_SELECT,
    })
    if (!release) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
    return toDetail(release, await this.loadReadiness(id, release.owner.id))
  }

  approve(id: string, staffId: string, input: ApproveReleaseDto, audit: AuditContextValue) {
    return this.decide(id, staffId, input.expectedUpdatedAt, audit, {
      status: ReleaseStatus.READY,
      review: { decision: ReleaseReviewDecision.APPROVED, message: input.message ?? null },
    })
  }

  requestChanges(
    id: string,
    staffId: string,
    input: RequestReleaseChangesDto,
    audit: AuditContextValue,
  ) {
    return this.decide(id, staffId, input.expectedUpdatedAt, audit, {
      status: ReleaseStatus.REJECTED,
      review: {
        decision: ReleaseReviewDecision.CHANGES_REQUESTED,
        message: input.message,
      },
    })
  }

  /** Lets a reviewer listen to a submitted master, honoring an HTTP Range for seeking. */
  async audioStream(id: string, trackId: string, range?: string) {
    const draft = await this.prisma.artistTrackDraft.findFirst({
      where: {
        id: trackId,
        releaseId: id,
        deletedAt: null,
        release: { deletedAt: null, status: { not: ReleaseStatus.DRAFT } },
      },
      select: { audioKey: true, audioContentType: true },
    })
    if (!draft?.audioKey) throw new NotFoundException(RELEASE_ERRORS.AUDIO_NOT_FOUND)
    let object: Awaited<ReturnType<StorageService['getObjectStream']>>
    try {
      object = await this.storage.getObjectStream(draft.audioKey, range)
    } catch {
      throw new NotFoundException(RELEASE_ERRORS.AUDIO_NOT_FOUND)
    }
    return { ...object, contentType: draft.audioContentType ?? object.contentType }
  }

  /** Takes a release offline for listeners; the artist cannot undo it. Audited. */
  async takeDown(id: string, staffId: string, audit: AuditContextValue) {
    const current = await this.prisma.release.findFirst({
      where: { id, deletedAt: null },
      select: { status: true },
    })
    if (!current) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
    const release = await this.publishing.takeDown(id)
    await this.prisma.$transaction((tx) =>
      writeTakeDownAudit({
        tx,
        entityType: 'release',
        entityId: id,
        action: 'release.take-down',
        staffId,
        before: { status: current.status },
        after: { status: ReleaseStatus.UNPUBLISHED },
        requestId: audit.requestId,
        ipAddress: audit.ipAddress,
      }),
    )
    return release
  }

  /** Restarts a release whose publishing failed; converted tracks are kept. Audited. */
  async retryPublishing(id: string, staffId: string, audit: AuditContextValue) {
    const release = await this.publishing.retry(id)
    await this.prisma.$transaction((tx) =>
      writeTakeDownAudit({
        tx,
        entityType: 'release',
        entityId: id,
        action: 'release.retry-publishing',
        staffId,
        before: { status: ReleaseStatus.PUBLISH_FAILED },
        after: { status: ReleaseStatus.PUBLISHING },
        requestId: audit.requestId,
        ipAddress: audit.ipAddress,
      }),
    )
    return release
  }

  /** Loads what the submission rules read and evaluates them for the reviewer. */
  private async loadReadiness(id: string, ownerId: string): Promise<ReleaseReadiness> {
    const record = await this.prisma.release.findFirstOrThrow({
      where: { id },
      select: releaseReadinessSelect(ownerId),
    })
    return releaseReadiness(readinessFromRecord(record))
  }

  private decide(
    id: string,
    staffId: string,
    expectedUpdatedAt: string,
    audit: AuditContextValue,
    outcome: DecisionOutcome,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const release = await this.claimSubmitted(tx, id, expectedUpdatedAt, outcome.status)
      const review = await tx.releaseReview.create({
        data: { ...outcome.review, releaseId: id, staffId },
        select: REVIEW_SELECT,
      })
      await this.writeDecisionAudit(tx, id, staffId, audit, outcome)
      return { release, review: toReview(review) }
    })
  }

  /**
   * Moves the release to `status` only if it is still SUBMITTED at `expectedUpdatedAt`; when
   * nothing matched, tells a missing release (404) from a changed or decided one (409).
   */
  private async claimSubmitted(
    tx: Prisma.TransactionClient,
    id: string,
    expectedUpdatedAt: string,
    status: ReleaseStatus,
  ): Promise<DecidedRelease> {
    const [release] = await tx.release.updateManyAndReturn({
      where: {
        id,
        deletedAt: null,
        status: ReleaseStatus.SUBMITTED,
        updatedAt: new Date(expectedUpdatedAt),
      },
      data: { status },
      select: DECIDED_SELECT,
    })
    if (release) return release

    const exists = await tx.release.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    })
    if (!exists) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
    throw new ConflictException(RELEASE_ERRORS.CHANGED_OR_NOT_SUBMITTED)
  }

  private writeDecisionAudit(
    tx: Prisma.TransactionClient,
    id: string,
    staffId: string,
    audit: AuditContextValue,
    outcome: DecisionOutcome,
  ): Promise<void> {
    return writeTakeDownAudit({
      tx,
      entityType: 'release',
      entityId: id,
      action:
        outcome.review.decision === ReleaseReviewDecision.APPROVED
          ? 'release.approve'
          : 'release.request-changes',
      staffId,
      reason: outcome.review.message ?? undefined,
      before: { status: ReleaseStatus.SUBMITTED },
      after: { status: outcome.status },
      requestId: audit.requestId,
      ipAddress: audit.ipAddress,
    })
  }
}

/** The queue filter: not deleted, the chosen status (or every reviewed one), title/handle search. */
function listWhere(query: ListAdminReleasesQueryDto): Prisma.ReleaseWhereInput {
  return {
    deletedAt: null,
    status: query.status === 'ALL' ? { in: [...ADMIN_REVIEWED_STATUSES] } : query.status,
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q, mode: 'insensitive' } },
            { owner: { username: { contains: query.q, mode: 'insensitive' } } },
          ],
        }
      : {}),
  }
}

function toRow({ owner, _count, ...release }: RowRecord) {
  return {
    ...release,
    artistId: owner.id,
    artistUsername: owner.username,
    trackCount: _count.trackDrafts,
  }
}

function toReview({ staff, ...review }: ReviewRecord) {
  return { ...review, reviewerUsername: staff?.username ?? null }
}

/** The reviewer's detail shape: the row, rights grouped, audio reduced to `hasAudio`. */
function toDetail(release: DetailRecord, readiness: ReleaseReadiness) {
  const { trackDrafts, territories, destinations, reviews, ...rest } = release
  return {
    ...toRow(rest),
    upc: rest.upc,
    scheduledAt: rest.scheduledAt,
    rights: {
      masterOwnerType: rest.masterOwnerType,
      masterOwnerName: rest.masterOwnerName,
      writersConfirmedAt: rest.writersConfirmedAt,
      accuracyConfirmedAt: rest.accuracyConfirmedAt,
    },
    tracks: trackDrafts.map(({ audioKey, ...track }) => ({ ...track, hasAudio: !!audioKey })),
    contributors: rest.contributors,
    splits: rest.splits,
    territories: territories.map((item) => item.countryCode),
    destinations: destinations.map((item) => item.destination),
    readiness,
    reviews: reviews.map(toReview),
  }
}
