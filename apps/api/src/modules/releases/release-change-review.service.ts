import { randomUUID } from 'node:crypto'
import { extname } from 'node:path'
import { normalizePagination } from '@common/pagination'
import { PrismaService } from '@infra/prisma/prisma.service'
import { removePublicImage } from '@infra/storage/public-images'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import { AlbumsService } from '@modules/albums/albums.service'
import { ReleaseTrackService } from '@modules/tracks/ingest'
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { type Prisma, ReleaseChangeField, ReleaseChangeStatus } from '@prisma/client'
import { RELEASE_ERRORS } from './errors'
import {
  acceptsChanges,
  type ChangeableRelease,
  lockReleaseForChanges,
  RELEASE_CHANGE_SELECT,
  removePendingCovers,
  toChangeView,
} from './release-change-rules'
import { COVER_FOLDER, COVER_PATH_PREFIX, coverName } from './release-cover.service'

/** A reviewer's outcome for one pending change; a rejection always says why. */
export type ReleaseChangeDecision =
  | { changeId: string; decision: 'APPROVE' }
  | { changeId: string; decision: 'REJECT'; reason: string }

export type DecideReleaseChangesInput = {
  decisions: ReleaseChangeDecision[]
  /** Optional comment on the whole request, in Markdown; replaces an earlier one. */
  message?: string
}

export type ReleaseChangeQueueQuery = {
  status: 'OPEN' | 'CLOSED'
  page?: number
  limit?: number
}

type PendingChange = {
  id: string
  field: ReleaseChangeField
  draftId: string | null
  proposedValue: string
}

/** What a decision applies to the live release, collected so each row is written once. */
type CatalogueUpdate = {
  release: { title?: string; cover?: string }
  recordings: { draftId: string; title: string }[]
}

const QUEUE_ROW_SELECT = {
  id: true,
  releaseId: true,
  createdAt: true,
  closedAt: true,
  release: { select: { title: true, cover: true, owner: { select: { username: true } } } },
  changes: { select: { status: true } },
} as const satisfies Prisma.ReleaseChangeRequestSelect

const DETAIL_SELECT = {
  id: true,
  releaseId: true,
  message: true,
  closedAt: true,
  createdAt: true,
  release: {
    select: {
      id: true,
      title: true,
      cover: true,
      status: true,
      unpublishedBy: true,
      owner: { select: { id: true, username: true } },
    },
  },
  changes: {
    select: { ...RELEASE_CHANGE_SELECT, staff: { select: { username: true } } },
    orderBy: { createdAt: 'asc' },
  },
} as const satisfies Prisma.ReleaseChangeRequestSelect

type DetailRecord = Prisma.ReleaseChangeRequestGetPayload<{ select: typeof DETAIL_SELECT }>

/**
 * Bitrate's review of changes artists propose to published releases. Each pending change is
 * approved or rejected on its own; approval writes the value to the release, its album and its
 * catalogue tracks through their owning services. A request closes when nothing is pending.
 */
@Injectable()
export class ReleaseChangeReviewService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
    private readonly albums: AlbumsService,
    private readonly tracks: ReleaseTrackService,
  ) {}

  /** Open requests oldest first, so the queue is worked in arrival order; closed newest first. */
  async list(query: ReleaseChangeQueueQuery) {
    const { page, limit, skip } = normalizePagination(query.page, query.limit)
    const open = query.status === 'OPEN'
    const where = {
      closedAt: open ? null : { not: null },
    } satisfies Prisma.ReleaseChangeRequestWhereInput
    const [rows, total] = await Promise.all([
      this.prisma.releaseChangeRequest.findMany({
        where,
        select: QUEUE_ROW_SELECT,
        orderBy: open
          ? [{ createdAt: 'asc' }, { id: 'asc' }]
          : [{ closedAt: 'desc' }, { id: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.releaseChangeRequest.count({ where }),
    ])
    const data = rows.map(({ release, changes, ...row }) => ({
      ...row,
      releaseTitle: release.title,
      releaseCover: release.cover,
      artistUsername: release.owner.username,
      changeCount: changes.length,
      pendingCount: changes.filter((change) => change.status === ReleaseChangeStatus.PENDING)
        .length,
    }))
    return { data, total, page, limit }
  }

  async stats() {
    return { open: await this.prisma.releaseChangeRequest.count({ where: { closedAt: null } }) }
  }

  async detail(requestId: string) {
    const request = await this.prisma.releaseChangeRequest.findUnique({
      where: { id: requestId },
      select: DETAIL_SELECT,
    })
    if (!request) throw new NotFoundException(RELEASE_ERRORS.CHANGE_REQUEST_NOT_FOUND)
    return this.toDetail(request)
  }

  /**
   * Applies the reviewer's decisions atomically. An approved cover is copied to the public
   * folder before the transaction and removed again if the decision fails.
   */
  async decide(requestId: string, staffId: string, input: DecideReleaseChangesInput) {
    const published = await this.publishApprovedCovers(requestId, input.decisions)
    let outcome: Awaited<ReturnType<typeof this.applyDecisions>>
    try {
      outcome = await this.prisma.$transaction((tx) =>
        this.applyDecisions(tx, requestId, staffId, input, published),
      )
    } catch (error) {
      await Promise.all(
        [...published.values()].map((path) =>
          removePublicImage(this.storage, COVER_FOLDER, coverName(path)),
        ),
      )
      throw error
    }
    await removePendingCovers(this.storage, outcome.discardedCovers)
    await Promise.all(
      outcome.replacedCovers.map((path) =>
        removePublicImage(this.storage, COVER_FOLDER, coverName(path)),
      ),
    )
    if (outcome.approved) {
      await Promise.all([
        this.albums.invalidateCatalogueCaches(),
        this.tracks.invalidateCatalogueCaches(),
      ])
    }
    return outcome.requestId
  }

  private async applyDecisions(
    tx: Prisma.TransactionClient,
    requestId: string,
    staffId: string,
    input: DecideReleaseChangesInput,
    published: ReadonlyMap<string, string>,
  ) {
    const request = await tx.releaseChangeRequest.findUnique({
      where: { id: requestId },
      select: { id: true, releaseId: true },
    })
    if (!request) throw new NotFoundException(RELEASE_ERRORS.CHANGE_REQUEST_NOT_FOUND)
    const release = await lockReleaseForChanges(tx, request.releaseId)
    if (!(release && acceptsChanges(release))) {
      throw new ConflictException(RELEASE_ERRORS.CHANGES_NOT_ALLOWED)
    }
    const ids = input.decisions.map((decision) => decision.changeId)
    const pending: PendingChange[] = await tx.releaseChange.findMany({
      where: { requestId, id: { in: ids }, status: ReleaseChangeStatus.PENDING },
      select: { id: true, field: true, draftId: true, proposedValue: true },
    })
    if (pending.length !== new Set(ids).size) {
      throw new ConflictException(RELEASE_ERRORS.CHANGE_NOT_PENDING)
    }
    const byId = new Map(pending.map((change) => [change.id, change]))
    const update: CatalogueUpdate = { release: {}, recordings: [] }
    const discardedCovers: string[] = []
    const decidedAt = new Date()
    for (const decision of input.decisions) {
      const change = byId.get(decision.changeId) as PendingChange
      if (change.field === ReleaseChangeField.RELEASE_COVER)
        discardedCovers.push(change.proposedValue)
      const approved = decision.decision === 'APPROVE'
      const proposedValue = approved ? collect(update, change, published) : undefined
      await tx.releaseChange.update({
        where: { id: change.id },
        data: {
          status: approved ? ReleaseChangeStatus.APPROVED : ReleaseChangeStatus.REJECTED,
          pendingTarget: null,
          reason: decision.decision === 'REJECT' ? decision.reason : null,
          staffId,
          decidedAt,
          ...(proposedValue ? { proposedValue } : {}),
        },
      })
    }
    await this.applyToCatalogue(tx, release, update)
    const remaining = await tx.releaseChange.count({
      where: { requestId, status: ReleaseChangeStatus.PENDING },
    })
    await tx.releaseChangeRequest.update({
      where: { id: requestId },
      data: {
        ...(input.message === undefined ? {} : { message: input.message }),
        closedAt: remaining ? null : decidedAt,
      },
      select: { id: true },
    })
    const coverReplaced = update.release.cover !== undefined && release.cover
    return {
      requestId,
      discardedCovers,
      replacedCovers: coverReplaced ? [release.cover as string] : [],
      approved: input.decisions.some((decision) => decision.decision === 'APPROVE'),
    }
  }

  /** Writes approved values; the release keeps its version so status notifications stay put. */
  private async applyToCatalogue(
    tx: Prisma.TransactionClient,
    release: ChangeableRelease,
    update: CatalogueUpdate,
  ) {
    const details = update.release
    if (details.title !== undefined || details.cover !== undefined) {
      await tx.release.update({
        where: { id: release.id },
        data: { ...details, updatedAt: release.updatedAt },
      })
      if (release.albumId) await this.albums.updateReleaseAlbumDetails(tx, release.albumId, details)
    }
    if (details.cover !== undefined) {
      // Compilations reuse recordings under their own artwork, so only native tracks change.
      const native = await tx.releaseTrack.findMany({
        where: { releaseId: release.id, reused: false },
        select: { trackId: true },
      })
      await this.tracks.updateReleaseTrackDetails(
        tx,
        native.map(({ trackId }) => trackId),
        { cover: details.cover },
      )
    }
    for (const { draftId, title } of update.recordings) {
      await tx.artistTrackDraft.update({ where: { id: draftId }, data: { title } })
      const link = await tx.releaseTrack.findUnique({
        where: { draftId },
        select: { trackId: true },
      })
      if (link) await this.tracks.updateReleaseTrackDetails(tx, [link.trackId], { title })
    }
  }

  /** Copies each approved cover to the public folder, keyed by change id. */
  private async publishApprovedCovers(
    requestId: string,
    decisions: readonly ReleaseChangeDecision[],
  ): Promise<Map<string, string>> {
    const approved = decisions
      .filter((decision) => decision.decision === 'APPROVE')
      .map((decision) => decision.changeId)
    const published = new Map<string, string>()
    if (!approved.length) return published
    const covers = await this.prisma.releaseChange.findMany({
      where: {
        requestId,
        id: { in: approved },
        field: ReleaseChangeField.RELEASE_COVER,
        status: ReleaseChangeStatus.PENDING,
      },
      select: { id: true, proposedValue: true },
    })
    for (const cover of covers) {
      const object = await this.storage.getObjectStream(cover.proposedValue)
      const name = `${randomUUID()}${extname(cover.proposedValue)}`
      await this.storage.upload(
        `${COVER_FOLDER}/${name}`,
        object.stream,
        object.contentType ?? 'application/octet-stream',
      )
      published.set(cover.id, `${COVER_PATH_PREFIX}${name}`)
    }
    return published
  }

  private async toDetail({ release, changes, ...request }: DetailRecord) {
    return {
      ...request,
      release: {
        id: release.id,
        title: release.title,
        cover: release.cover,
        status: release.status,
        unpublishedBy: release.unpublishedBy,
        artistId: release.owner.id,
        artistUsername: release.owner.username,
      },
      changes: await Promise.all(
        changes.map(async ({ staff, ...change }) => ({
          ...(await toChangeView(this.storage, change)),
          reviewerUsername: staff?.username ?? null,
        })),
      ),
    }
  }
}

/** Records an approved value in `update`, returning the value stored on the change. */
function collect(
  update: CatalogueUpdate,
  change: PendingChange,
  published: ReadonlyMap<string, string>,
): string | undefined {
  switch (change.field) {
    case ReleaseChangeField.RELEASE_TITLE:
      update.release.title = change.proposedValue
      return undefined
    case ReleaseChangeField.RELEASE_COVER: {
      const path = published.get(change.id)
      if (!path) throw new ConflictException(RELEASE_ERRORS.CHANGE_NOT_PENDING)
      update.release.cover = path
      return path
    }
    case ReleaseChangeField.RECORDING_TITLE:
      if (!change.draftId) throw new ConflictException(RELEASE_ERRORS.RECORDING_LOCKED)
      update.recordings.push({ draftId: change.draftId, title: change.proposedValue })
      return undefined
  }
}
