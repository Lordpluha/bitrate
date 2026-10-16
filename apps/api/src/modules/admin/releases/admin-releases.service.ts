import { normalizePagination } from '@common/pagination'
import { PrismaService } from '@infra/prisma/prisma.service'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import { type AuditContextValue, writeTakeDownAudit } from '@modules/admin/shared'
import { RELEASE_ERRORS } from '@modules/releases/errors'
import { releaseReadiness } from '@modules/releases/release-readiness'
import { readinessFromRecord, releaseReadinessSelect } from '@modules/releases/releases.select'
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { type Prisma, ReleaseReviewDecision, ReleaseStatus } from '@prisma/client'
import type {
  ApproveReleaseDto,
  ListAdminReleasesQueryDto,
  RequestReleaseChangesDto,
} from './dtos/release-review.dto'

const ROW_SELECT = {
  id: true,
  title: true,
  type: true,
  status: true,
  cover: true,
  submittedAt: true,
  updatedAt: true,
  owner: { select: { id: true, username: true } },
  _count: { select: { trackDrafts: { where: { deletedAt: null } } } },
} as const satisfies Prisma.ReleaseSelect

const REVIEW_SELECT = {
  id: true,
  decision: true,
  message: true,
  requiredChanges: true,
  recommendations: true,
  createdAt: true,
  staff: { select: { username: true } },
} as const satisfies Prisma.ReleaseReviewSelect

type RowRecord = Prisma.ReleaseGetPayload<{ select: typeof ROW_SELECT }>

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
  ) {}

  async list(query: ListAdminReleasesQueryDto) {
    const { page, limit, skip } = normalizePagination(query.page, query.limit)
    const where: Prisma.ReleaseWhereInput = {
      deletedAt: null,
      status:
        query.status === 'ALL'
          ? { in: [ReleaseStatus.SUBMITTED, ReleaseStatus.READY, ReleaseStatus.REJECTED] }
          : query.status,
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { owner: { username: { contains: query.q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    }
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
      select: {
        ...ROW_SELECT,
        upc: true,
        scheduledAt: true,
        masterOwnerType: true,
        masterOwnerName: true,
        writersConfirmedAt: true,
        accuracyConfirmedAt: true,
        trackDrafts: {
          where: { deletedAt: null },
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            title: true,
            duration: true,
            isrc: true,
            audioKey: true,
            audioFileName: true,
          },
        },
        contributors: {
          orderBy: [{ displayName: 'asc' }, { id: 'asc' }],
          select: { id: true, displayName: true, roles: true },
        },
        splits: { select: { contributorId: true, rightType: true, shareBasisPoints: true } },
        territories: { select: { countryCode: true }, orderBy: { countryCode: 'asc' } },
        destinations: { select: { destination: true } },
        reviews: { orderBy: { createdAt: 'desc' }, take: 20, select: REVIEW_SELECT },
      },
    })
    if (!release) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
    const readiness = await this.prisma.release.findFirstOrThrow({
      where: { id },
      select: releaseReadinessSelect(release.owner.id),
    })
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
      readiness: releaseReadiness(readinessFromRecord(readiness)),
      reviews: reviews.map(toReview),
    }
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
        message: input.message ?? null,
        requiredChanges: input.requiredChanges,
        recommendations: input.recommendations,
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

  private decide(
    id: string,
    staffId: string,
    expectedUpdatedAt: string,
    audit: AuditContextValue,
    outcome: {
      status: ReleaseStatus
      review: Omit<Prisma.ReleaseReviewUncheckedCreateInput, 'releaseId' | 'staffId'>
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const [release] = await tx.release.updateManyAndReturn({
        where: {
          id,
          deletedAt: null,
          status: ReleaseStatus.SUBMITTED,
          updatedAt: new Date(expectedUpdatedAt),
        },
        data: { status: outcome.status },
        select: { id: true, status: true, updatedAt: true },
      })
      if (!release) {
        const exists = await tx.release.findFirst({
          where: { id, deletedAt: null },
          select: { id: true },
        })
        if (!exists) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
        throw new ConflictException(RELEASE_ERRORS.CHANGED_OR_NOT_SUBMITTED)
      }
      const review = await tx.releaseReview.create({
        data: { ...outcome.review, releaseId: id, staffId },
        select: REVIEW_SELECT,
      })
      await writeTakeDownAudit({
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
      return { release, review: toReview(review) }
    })
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

function toReview({
  staff,
  ...review
}: Prisma.ReleaseReviewGetPayload<{ select: typeof REVIEW_SELECT }>) {
  return { ...review, reviewerUsername: staff?.username ?? null }
}
