import { DEFAULT_LIMIT, DEFAULT_PAGE, type PaginationInput } from '@common/pagination'
import { buildSortOrderBy, type SortInput } from '@common/sort'
import { PrismaService } from '@infra/prisma/prisma.service'
import type { AdminResourceStatus, AuditContextValue } from '@modules/admin/shared'
import { isoOrNull, writeTakeDownAudit } from '@modules/admin/shared'
import { TrackUploadService } from '@modules/tracks'
import { Injectable } from '@nestjs/common'
import { Prisma, type TrackProcessingStatus } from '@prisma/client'
import type { ADMIN_TRACKS_SORT_FIELDS } from './dtos'
import type {
  AdminTrackAlbumEntity,
  AdminTrackArtistCreditEntity,
  AdminTrackFileEntity,
  AdminTrackGenreEntity,
} from './entities'
import {
  TrackAlreadyDeletedException,
  TrackNotDeletedException,
  TrackNotFoundException,
} from './errors'

/** One of the track pipeline's allowed sort fields. */
type AdminTracksSortField = (typeof ADMIN_TRACKS_SORT_FIELDS)[number]

/** Input for listing operator-facing tracks. */
type ListTracksInput = {
  page?: number
  limit?: number
  processingStatus?: TrackProcessingStatus
  status?: AdminResourceStatus
  q?: string
} & SortInput<AdminTracksSortField>

/** A row of the operator track list, with its primary artist's name resolved. */
type AdminTrackRow = {
  id: string
  title: string
  artistId: string
  artistUsername: string
  cover: string | null
  processingStatus: TrackProcessingStatus
  processingError: string | null
  processingAttempts: number
  processingStartedAt: Date | null
  processingFinishedAt: Date | null
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/** The extended detail shape shown on the track detail page. */
type AdminTrackDetail = AdminTrackRow & {
  audioFiles: AdminTrackFileEntity[]
  artists: AdminTrackArtistCreditEntity[]
  genres: AdminTrackGenreEntity[]
  albums: AdminTrackAlbumEntity[]
  openReportCount: number
}

/** Prisma's include shape for hydrating an {@link AdminTrackDetail}. */
const DETAIL_INCLUDE = {
  artist: { select: { username: true } },
  audioFiles: { select: { id: true, format: true, bitrate: true, codec: true, size: true } },
  artists: { include: { artist: { select: { username: true } } } },
  genres: { include: { genre: { select: { id: true, name: true, slug: true } } } },
  albums: { include: { album: { select: { id: true, title: true } } } },
} satisfies Prisma.TrackInclude

type TrackWithDetail = Prisma.TrackGetPayload<{ include: typeof DETAIL_INCLUDE }>

/**
 * Handles the operator-facing track pipeline queue.
 *
 * Listing defaults to surfacing problems first — `FAILED`, then the longest-stuck
 * `PROCESSING` rows, then everything else — because this screen exists for stuck
 * uploads, not an alphabetical catalog browse. That ordering can't be expressed as a
 * plain Prisma `orderBy`, so it's resolved with a small raw-SQL `CASE` query that
 * only ever selects ids; the actual rows are hydrated back through normal Prisma
 * `findMany` + `include`, keeping the raw-SQL surface (and its blast radius) minimal.
 */
@Injectable()
export class AdminTracksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trackUpload: TrackUploadService,
  ) {}

  /** Builds the `deletedAt` half of the `where` clause for the `status` take-down filter. */
  private buildStatusWhere(status: AdminResourceStatus = 'active') {
    if (status === 'all') return {}
    if (status === 'deactivated') return { deletedAt: { not: null } }
    return { deletedAt: null }
  }

  /** Builds the shared Prisma `where` clause for counting. */
  private buildWhere({ processingStatus, status, q }: Omit<ListTracksInput, 'page' | 'limit'>) {
    return {
      ...this.buildStatusWhere(status),
      ...(processingStatus && { processingStatus }),
      ...(q && { title: { contains: q, mode: 'insensitive' } }),
    } satisfies Prisma.TrackWhereInput
  }

  /** Builds the matching raw-SQL `WHERE` fragment for the ordered id query. */
  private buildRawWhere({
    processingStatus,
    status = 'active',
    q,
  }: Omit<ListTracksInput, 'page' | 'limit'>) {
    const deletedFragment =
      status === 'all'
        ? Prisma.empty
        : status === 'deactivated'
          ? Prisma.sql`AND "deletedAt" IS NOT NULL`
          : Prisma.sql`AND "deletedAt" IS NULL`

    return Prisma.sql`
      WHERE TRUE
        ${deletedFragment}
        ${processingStatus ? Prisma.sql`AND "processingStatus" = ${processingStatus}::"TrackProcessingStatus"` : Prisma.empty}
        ${q ? Prisma.sql`AND title ILIKE ${`%${q}%`}` : Prisma.empty}
    `
  }

  /**
   * Runs the find all operation, paginated. Problem-first by default via the raw-SQL `CASE`
   * query described above; choosing a `sort` replaces that attention-first ordering with a
   * plain Prisma `orderBy` on the chosen field instead — the two orderings are never merged.
   *
   * Within the `PROCESSING` group, ordering by `COALESCE("processingStartedAt", "updatedAt")`
   * rather than `processingStartedAt` alone matters: a track a worker never dequeued has
   * `processingStartedAt: null` forever, and `NULLS LAST` would sink exactly the rows this
   * screen exists to surface — the ones stuck before they ever started — to the bottom of their
   * own group. `updatedAt` is bumped by the same create/reprocess writes that would otherwise
   * set `processingStartedAt`, so it stands in as "how long has this been sitting" for a row
   * that never got that far.
   */
  async findAll({
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    processingStatus,
    status,
    q,
    sort,
    order,
  }: ListTracksInput) {
    if (sort) return this.findAllSorted({ page, limit, processingStatus, status, q, sort, order })

    const where = this.buildWhere({ processingStatus, status, q })
    const rawWhere = this.buildRawWhere({ processingStatus, status, q })
    const skip = (page - 1) * limit

    const [orderedIds, total] = await Promise.all([
      this.prisma.queryRaw<{ id: string }[]>(Prisma.sql`
        SELECT id FROM "Track"
        ${rawWhere}
        ORDER BY
          CASE "processingStatus" WHEN 'FAILED' THEN 0 WHEN 'PROCESSING' THEN 1 ELSE 2 END,
          COALESCE("processingStartedAt", "updatedAt") ASC,
          "createdAt" DESC
        OFFSET ${skip} LIMIT ${limit}
      `),
      this.prisma.track.count({ where }),
    ])

    const data = await this.hydrateOrdered(orderedIds.map((row) => row.id))
    return { data, total, page, limit }
  }

  /** The `sort`-driven path: a plain Prisma query, ordered by the chosen field with `id` as
   * the stable tie-break — no raw SQL, no attention-first ordering. */
  private async findAllSorted({
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    processingStatus,
    status,
    q,
    sort,
    order,
  }: ListTracksInput) {
    const where = this.buildWhere({ processingStatus, status, q })
    const orderBy = buildSortOrderBy({ sort, order }, [{ createdAt: 'desc' }, { id: 'desc' }])

    const [tracks, total] = await Promise.all([
      this.prisma.track.findMany({
        where,
        include: { artist: { select: { username: true } } },
        orderBy: orderBy as unknown as Prisma.TrackOrderByWithRelationInput[],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.track.count({ where }),
    ])

    return { data: tracks.map((track) => this.toRow(track)), total, page, limit }
  }

  /** Fetches full rows for the given ids and restores the id order raw SQL computed. */
  private async hydrateOrdered(ids: string[]): Promise<AdminTrackRow[]> {
    if (ids.length === 0) return []

    const tracks = await this.prisma.track.findMany({
      where: { id: { in: ids } },
      include: { artist: { select: { username: true } } },
    })
    const byId = new Map(tracks.map((track) => [track.id, track]))

    return ids.flatMap((id) => {
      const track = byId.get(id)
      return track ? [this.toRow(track)] : []
    })
  }

  /** Flattens a track (with its artist included) into the operator row shape. */
  private toRow(track: {
    id: string
    title: string
    artistId: string
    artist: { username: string }
    cover: string | null
    processingStatus: TrackProcessingStatus
    processingError: string | null
    processingAttempts: number
    processingStartedAt: Date | null
    processingFinishedAt: Date | null
    deletedAt: Date | null
    createdAt: Date
    updatedAt: Date
  }): AdminTrackRow {
    return {
      id: track.id,
      title: track.title,
      artistId: track.artistId,
      artistUsername: track.artist.username,
      cover: track.cover,
      processingStatus: track.processingStatus,
      processingError: track.processingError,
      processingAttempts: track.processingAttempts,
      processingStartedAt: track.processingStartedAt,
      processingFinishedAt: track.processingFinishedAt,
      deletedAt: track.deletedAt,
      createdAt: track.createdAt,
      updatedAt: track.updatedAt,
    }
  }

  /** Flattens a track with the full detail include into the detail response shape. */
  private toDetail(track: TrackWithDetail, openReportCount: number): AdminTrackDetail {
    return {
      ...this.toRow(track),
      audioFiles: track.audioFiles,
      artists: track.artists.map((credit) => ({
        artistId: credit.artistId,
        username: credit.artist.username,
        isPrimary: credit.isPrimary,
        position: credit.position,
      })),
      genres: track.genres.map((entry) => entry.genre),
      albums: track.albums.map((entry) => ({
        id: entry.album.id,
        title: entry.album.title,
        trackNumber: entry.trackNumber,
        discNumber: entry.discNumber,
      })),
      openReportCount,
    }
  }

  /**
   * Runs the find by id operation. Deliberately does not filter `deletedAt` — a soft-deleted
   * track must stay reachable so the operator can review it before deciding to restore it.
   */
  async findById(id: string): Promise<AdminTrackDetail> {
    const track = await this.prisma.track.findFirst({ where: { id }, include: DETAIL_INCLUDE })
    if (!track) throw new TrackNotFoundException(id)

    const openReportCount = await this.prisma.moderationReport.count({
      where: { entityType: 'track', entityId: id, status: 'OPEN' },
    })

    return this.toDetail(track, openReportCount)
  }

  /**
   * Lists a track's recorded processing attempts, newest first. Deliberately does not filter
   * `deletedAt` — same reasoning as {@link findById}, the history stays reachable for a
   * soft-deleted track.
   */
  async findProcessingAttempts(
    id: string,
    { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT }: PaginationInput,
  ) {
    const track = await this.prisma.track.findFirst({ where: { id } })
    if (!track) throw new TrackNotFoundException(id)

    const [data, total] = await Promise.all([
      this.prisma.trackProcessingAttempt.findMany({
        where: { trackId: id },
        orderBy: [{ startedAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.trackProcessingAttempt.count({ where: { trackId: id } }),
    ])

    return { data, total, page, limit }
  }

  /**
   * Re-queues a track's stored source file for transcoding.
   *
   * Reuses the existing audio-processing producer
   * (`TrackUploadService.reprocess`) instead of a second queue.
   */
  async reprocess(id: string) {
    const existing = await this.prisma.track.findFirst({ where: { id } })
    if (!existing) throw new TrackNotFoundException(id)
    if (existing.deletedAt) throw new TrackAlreadyDeletedException(id)

    return await this.trackUpload.reprocess(id)
  }

  /**
   * Soft-deletes a track, recording the operator's stated reason in an audit row.
   *
   * The write is an `updateMany` scoped to `deletedAt: null` inside the transaction, not a
   * plain `update` — two concurrent take-down requests for the same track would otherwise both
   * "succeed", the second silently re-stamping `deletedAt` and re-writing an audit row for an
   * action that already happened. A `count` of 0 means someone else won the race, which is a
   * 409, not the 404 a genuinely missing track gets.
   */
  async softDelete(
    id: string,
    staffId: string,
    reason?: string,
    auditContext: AuditContextValue = {},
  ): Promise<AdminTrackRow> {
    const existing = await this.prisma.track.findFirst({ where: { id } })
    if (!existing) throw new TrackNotFoundException(id)
    if (existing.deletedAt) throw new TrackAlreadyDeletedException(id)

    return await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.track.updateMany({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
      })
      if (count === 0) throw new TrackAlreadyDeletedException(id)

      const updated = await tx.track.findFirstOrThrow({
        where: { id },
        include: { artist: { select: { username: true } } },
      })
      await writeTakeDownAudit({
        tx,
        entityType: 'admin-tracks',
        entityId: id,
        action: 'admin-tracks.delete',
        staffId,
        reason,
        before: { deletedAt: isoOrNull(existing.deletedAt) },
        after: { deletedAt: isoOrNull(updated.deletedAt) },
        ...auditContext,
      })
      return this.toRow(updated)
    })
  }

  /**
   * Restores a soft-deleted track, recording the operator's stated reason in an audit row.
   * Uses the same `updateMany` + count-guard pattern as {@link softDelete} for the same
   * concurrent-request reason.
   */
  async restore(
    id: string,
    staffId: string,
    reason?: string,
    auditContext: AuditContextValue = {},
  ): Promise<AdminTrackRow> {
    const existing = await this.prisma.track.findFirst({ where: { id } })
    if (!existing) throw new TrackNotFoundException(id)
    if (!existing.deletedAt) throw new TrackNotDeletedException(id)

    return await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.track.updateMany({
        where: { id, deletedAt: { not: null } },
        data: { deletedAt: null },
      })
      if (count === 0) throw new TrackNotDeletedException(id)

      const updated = await tx.track.findFirstOrThrow({
        where: { id },
        include: { artist: { select: { username: true } } },
      })
      await writeTakeDownAudit({
        tx,
        entityType: 'admin-tracks',
        entityId: id,
        action: 'admin-tracks.restore',
        staffId,
        reason,
        before: { deletedAt: isoOrNull(existing.deletedAt) },
        after: { deletedAt: isoOrNull(updated.deletedAt) },
        ...auditContext,
      })
      return this.toRow(updated)
    })
  }
}
