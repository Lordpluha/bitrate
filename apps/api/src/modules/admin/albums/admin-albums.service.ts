import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@common/pagination'
import { buildSortOrderBy, type SortInput } from '@common/sort'
import { PrismaService } from '@infra/prisma/prisma.service'
import type { AdminResourceStatus, AuditContextValue } from '@modules/admin/shared'
import {
  runTakeDownTransition,
  statusWhere,
  type TakeDownActor,
  type TakeDownDirection,
} from '@modules/admin/shared'
import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import type { ADMIN_ALBUMS_SORT_FIELDS } from './dtos'
import type { AdminAlbumEntity, AdminAlbumTrackEntity } from './entities'
import {
  AlbumAlreadyDeletedException,
  AlbumNotDeletedException,
  AlbumNotFoundException,
} from './errors'

/** One of the album list's allowed sort fields. */
type AdminAlbumsSortField = (typeof ADMIN_ALBUMS_SORT_FIELDS)[number]

/** Input for listing operator-facing albums. */
type ListAlbumsInput = {
  page?: number
  limit?: number
  status?: AdminResourceStatus
  artistId?: string
  q?: string
} & SortInput<AdminAlbumsSortField>

/** The columns the list, detail and take-down responses share, with the artist's name joined. */
const ALBUM_ROW_SELECT = {
  id: true,
  title: true,
  cover: true,
  artistId: true,
  artist: { select: { username: true } },
  type: true,
  totalTracks: true,
  releaseDate: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.AlbumSelect

/** The row columns plus the metadata and ordered tracks only the detail page shows. */
const ALBUM_DETAIL_SELECT = {
  ...ALBUM_ROW_SELECT,
  description: true,
  label: true,
  copyright: true,
  tracks: {
    orderBy: [{ discNumber: 'asc' }, { trackNumber: 'asc' }],
    select: {
      trackNumber: true,
      discNumber: true,
      track: { select: { id: true, title: true, processingStatus: true, deletedAt: true } },
    },
  },
} as const satisfies Prisma.AlbumSelect

type AlbumRowRecord = Prisma.AlbumGetPayload<{ select: typeof ALBUM_ROW_SELECT }>
type AlbumDetailRecord = Prisma.AlbumGetPayload<{ select: typeof ALBUM_DETAIL_SELECT }>

/** Handles the operator-facing album catalog and its take-down. */
@Injectable()
export class AdminAlbumsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Builds the shared `where` clause for listing and counting. */
  private buildWhere({ status, artistId, q }: Omit<ListAlbumsInput, 'page' | 'limit'>) {
    return {
      ...statusWhere(status),
      ...(artistId && { artistId }),
      ...(q && { title: { contains: q, mode: 'insensitive' } }),
    } satisfies Prisma.AlbumWhereInput
  }

  /** Flattens an album (with its artist joined) into the operator row shape. */
  private toRow({ artist, ...album }: AlbumRowRecord): AdminAlbumEntity {
    return { ...album, artistUsername: artist.username }
  }

  /** Runs the find all operation, paginated, newest first by default. */
  async findAll({
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    status,
    artistId,
    q,
    sort,
    order,
  }: ListAlbumsInput) {
    const where = this.buildWhere({ status, artistId, q })
    const orderBy = buildSortOrderBy<Prisma.AlbumOrderByWithRelationInput>({ sort, order }, [
      { createdAt: 'desc' },
      { id: 'desc' },
    ])
    const [rows, total] = await Promise.all([
      this.prisma.album.findMany({
        where,
        select: ALBUM_ROW_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      this.prisma.album.count({ where }),
    ])
    return { data: rows.map((row) => this.toRow(row)), total, page, limit }
  }

  /**
   * Runs the find by id operation, with the album's tracks ordered by disc then track number.
   * Deliberately does not filter `deletedAt` — a taken-down album must stay reachable by id so
   * the operator can review it before deciding to restore it. Each track carries its own
   * `deletedAt`: an album's take-down never cascades to them.
   */
  async findById(id: string) {
    const album = await this.prisma.album.findFirst({ where: { id }, select: ALBUM_DETAIL_SELECT })
    if (!album) throw new AlbumNotFoundException(id)
    return this.toDetail(album)
  }

  /** Flattens an album with its `AlbumTrack` rows into the detail response shape. */
  private toDetail({ tracks, ...album }: AlbumDetailRecord) {
    return {
      ...this.toRow(album),
      description: album.description,
      label: album.label,
      copyright: album.copyright,
      tracks: tracks.map(
        (entry): AdminAlbumTrackEntity => ({
          id: entry.track.id,
          title: entry.track.title,
          trackNumber: entry.trackNumber,
          discNumber: entry.discNumber,
          processingStatus: entry.track.processingStatus,
          deletedAt: entry.track.deletedAt,
        }),
      ),
    }
  }

  /**
   * Soft-deletes an album, recording the operator's stated reason in an audit row. The album's
   * tracks are deliberately left untouched — each stays independently manageable via
   * `admin/tracks`. The write is an `updateMany` scoped to `deletedAt: null` so a concurrent
   * take-down loses with a 409 rather than re-stamping the row.
   */
  softDelete(
    id: string,
    staffId: string,
    reason?: string,
    auditContext: AuditContextValue = {},
  ): Promise<AdminAlbumEntity> {
    return this.transition('take-down', id, { staffId, reason, ...auditContext })
  }

  /**
   * Restores a soft-deleted album, recording the operator's stated reason in an audit row.
   * Uses the same `updateMany` + count-guard pattern as {@link softDelete}.
   */
  restore(
    id: string,
    staffId: string,
    reason?: string,
    auditContext: AuditContextValue = {},
  ): Promise<AdminAlbumEntity> {
    return this.transition('restore', id, { staffId, reason, ...auditContext })
  }

  /** Takes an album down or restores it, with its audit row — see {@link runTakeDownTransition}. */
  private transition(
    direction: TakeDownDirection,
    id: string,
    actor: TakeDownActor,
  ): Promise<AdminAlbumEntity> {
    const takeDown = direction === 'take-down'
    return runTakeDownTransition({
      prisma: this.prisma,
      direction,
      current: () => this.prisma.album.findFirst({ where: { id }, select: { deletedAt: true } }),
      mark: (tx, guard, data) => tx.album.updateMany({ where: { id, ...guard }, data }),
      load: async (tx) =>
        this.toRow(await tx.album.findFirstOrThrow({ where: { id }, select: ALBUM_ROW_SELECT })),
      notFound: () => new AlbumNotFoundException(id),
      conflict: () =>
        takeDown ? new AlbumAlreadyDeletedException(id) : new AlbumNotDeletedException(id),
      audit: { entityType: 'admin-albums', entityId: id, ...actor },
    })
  }
}
