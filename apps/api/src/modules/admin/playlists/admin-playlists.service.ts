import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@common/pagination'
import { buildSortOrderBy, type SortInput } from '@common/sort'
import { PrismaService } from '@infra/prisma/prisma.service'
import type { AdminResourceStatus, AuditContextValue } from '@modules/admin/shared'
import { isoOrNull, writeTakeDownAudit } from '@modules/admin/shared'
import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import type { ADMIN_PLAYLISTS_SORT_FIELDS } from './dtos'
import type { AdminPlaylistEntity, AdminPlaylistTrackEntity } from './entities'
import {
  PlaylistAlreadyDeletedException,
  PlaylistAlreadyHiddenException,
  PlaylistAlreadyPublicException,
  PlaylistNotDeletedException,
  PlaylistNotFoundException,
  PlaylistNotHiddenByOperatorException,
} from './errors'

/** One of the playlist list's allowed sort fields. */
type AdminPlaylistsSortField = (typeof ADMIN_PLAYLISTS_SORT_FIELDS)[number]

/** Input for listing operator-facing playlists. */
type ListPlaylistsInput = {
  page?: number
  limit?: number
  status?: AdminResourceStatus
  ownerId?: string
  q?: string
} & SortInput<AdminPlaylistsSortField>

/** The audit entity type and actions this module writes; the unhide guard reads them back. */
const AUDIT_ENTITY_TYPE = 'admin-playlists'
const HIDE_ACTION = 'admin-playlists.hide'
const UNHIDE_ACTION = 'admin-playlists.unhide'

/** How many tracks the detail page shows; `trackCount` carries the full total. */
const DETAIL_TRACK_LIMIT = 50

/** The columns the list, detail and mutation responses share, with owner and track count joined. */
const PLAYLIST_ROW_SELECT = {
  id: true,
  title: true,
  cover: true,
  userId: true,
  user: { select: { username: true } },
  isPublic: true,
  followersCount: true,
  _count: { select: { tracks: true } },
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PlaylistSelect

/** The row columns plus the metadata and first tracks only the detail page shows. */
const PLAYLIST_DETAIL_SELECT = {
  ...PLAYLIST_ROW_SELECT,
  description: true,
  collaborative: true,
  tracks: {
    orderBy: { position: 'asc' },
    take: DETAIL_TRACK_LIMIT,
    select: { position: true, track: { select: { id: true, title: true } } },
  },
} as const satisfies Prisma.PlaylistSelect

type PlaylistRowRecord = Prisma.PlaylistGetPayload<{ select: typeof PLAYLIST_ROW_SELECT }>
type PlaylistDetailRecord = Prisma.PlaylistGetPayload<{ select: typeof PLAYLIST_DETAIL_SELECT }>

/** Handles the operator-facing public-playlist moderation: hide, take-down and restore. */
@Injectable()
export class AdminPlaylistsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Builds the `deletedAt` half of the `where` clause for the `status` take-down filter. */
  private buildStatusWhere(status: AdminResourceStatus = 'active') {
    if (status === 'all') return {}
    if (status === 'deactivated') return { deletedAt: { not: null } }
    return { deletedAt: null }
  }

  /**
   * Builds the shared `where` clause for listing and counting. `isPublic: true` is not
   * optional: private playlists are user content, never an operator moderation surface.
   */
  private buildWhere({ status, ownerId, q }: Omit<ListPlaylistsInput, 'page' | 'limit'>) {
    return {
      isPublic: true,
      ...this.buildStatusWhere(status),
      ...(ownerId && { userId: ownerId }),
      ...(q && { title: { contains: q, mode: 'insensitive' } }),
    } satisfies Prisma.PlaylistWhereInput
  }

  /** Flattens a playlist (owner and track count joined) into the operator row shape. */
  private toRow({ user, _count, userId, ...playlist }: PlaylistRowRecord): AdminPlaylistEntity {
    return { ...playlist, ownerId: userId, ownerUsername: user.username, trackCount: _count.tracks }
  }

  /** Runs the find all operation, paginated, newest first by default. */
  async findAll({
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    status,
    ownerId,
    q,
    sort,
    order,
  }: ListPlaylistsInput) {
    const where = this.buildWhere({ status, ownerId, q })
    const orderBy = buildSortOrderBy({ sort, order }, [{ createdAt: 'desc' }, { id: 'desc' }])
    const [rows, total] = await Promise.all([
      this.prisma.playlist.findMany({
        where,
        select: PLAYLIST_ROW_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: orderBy as unknown as Prisma.PlaylistOrderByWithRelationInput[],
      }),
      this.prisma.playlist.count({ where }),
    ])
    return { data: rows.map((row) => this.toRow(row)), total, page, limit }
  }

  /**
   * Runs the find by id operation. Deliberately filters neither `isPublic` nor `deletedAt` — a
   * hidden or taken-down playlist must stay reachable by id so the operator can review it and
   * reverse either action.
   */
  async findById(id: string) {
    const playlist = await this.prisma.playlist.findFirst({
      where: { id },
      select: PLAYLIST_DETAIL_SELECT,
    })
    if (!playlist) throw new PlaylistNotFoundException(id)
    return this.toDetail(playlist)
  }

  /** Flattens a playlist with its first `PlaylistTrack` rows into the detail response shape. */
  private toDetail({ tracks, description, collaborative, ...playlist }: PlaylistDetailRecord) {
    return {
      ...this.toRow(playlist),
      description,
      collaborative,
      tracks: tracks.map(
        (entry): AdminPlaylistTrackEntity => ({
          id: entry.track.id,
          title: entry.track.title,
          position: entry.position,
        }),
      ),
    }
  }

  /**
   * Hides (`isPublic: false`) or un-hides (`isPublic: true`) a playlist, recording the operator's
   * stated reason in an audit row. Writes `isPublic` and nothing else, so it never changes
   * `deletedAt`. The write is an `updateMany` scoped to the current visibility so a concurrent
   * change loses with a 409 rather than overwriting.
   *
   * Un-hiding is only permitted when the latest operator visibility action on the playlist was
   * a hide: without a "hidden by operator" column, the audit trail is what distinguishes an
   * operator hide from a playlist its owner made private — which an operator must never publish.
   */
  async setVisibility(
    id: string,
    isPublic: boolean,
    staffId: string,
    reason?: string,
    auditContext: AuditContextValue = {},
  ) {
    const existing = await this.prisma.playlist.findFirst({ where: { id } })
    if (!existing) throw new PlaylistNotFoundException(id)
    if (existing.isPublic === isPublic) throw this.visibilityConflict(id, isPublic)
    if (isPublic && !(await this.wasHiddenByOperator(id))) {
      throw new PlaylistNotHiddenByOperatorException(id)
    }

    return await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.playlist.updateMany({
        where: { id, isPublic: !isPublic },
        data: { isPublic },
      })
      if (count === 0) throw this.visibilityConflict(id, isPublic)

      const updated = await tx.playlist.findFirstOrThrow({
        where: { id },
        select: PLAYLIST_ROW_SELECT,
      })
      await writeTakeDownAudit({
        tx,
        entityType: AUDIT_ENTITY_TYPE,
        entityId: id,
        action: isPublic ? UNHIDE_ACTION : HIDE_ACTION,
        staffId,
        reason,
        before: { isPublic: existing.isPublic },
        after: { isPublic: updated.isPublic },
        ...auditContext,
      })
      return this.toRow(updated)
    })
  }

  /** The conflict raised when the playlist is already in the requested visibility. */
  private visibilityConflict(id: string, isPublic: boolean) {
    return isPublic
      ? new PlaylistAlreadyPublicException(id)
      : new PlaylistAlreadyHiddenException(id)
  }

  /** Whether the most recent operator visibility action on the playlist was a hide. */
  private async wasHiddenByOperator(id: string) {
    const latest = await this.prisma.auditLog.findFirst({
      where: {
        entityType: AUDIT_ENTITY_TYPE,
        entityId: id,
        action: { in: [HIDE_ACTION, UNHIDE_ACTION] },
      },
      orderBy: { createdAt: 'desc' },
      select: { action: true },
    })
    return latest?.action === HIDE_ACTION
  }

  /**
   * Soft-deletes a playlist, recording the operator's stated reason in an audit row. Writes
   * `deletedAt` and nothing else, so visibility is untouched. The write is an `updateMany`
   * scoped to `deletedAt: null` so a concurrent take-down loses with a 409.
   */
  async softDelete(
    id: string,
    staffId: string,
    reason?: string,
    auditContext: AuditContextValue = {},
  ) {
    const existing = await this.prisma.playlist.findFirst({ where: { id } })
    if (!existing) throw new PlaylistNotFoundException(id)
    if (existing.deletedAt) throw new PlaylistAlreadyDeletedException(id)

    return await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.playlist.updateMany({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
      })
      if (count === 0) throw new PlaylistAlreadyDeletedException(id)

      const updated = await tx.playlist.findFirstOrThrow({
        where: { id },
        select: PLAYLIST_ROW_SELECT,
      })
      await writeTakeDownAudit({
        tx,
        entityType: AUDIT_ENTITY_TYPE,
        entityId: id,
        action: 'admin-playlists.delete',
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
   * Restores a soft-deleted playlist, recording the operator's stated reason in an audit row.
   * Clears `deletedAt` only — a hidden playlist stays hidden. Same guard as {@link softDelete}.
   */
  async restore(
    id: string,
    staffId: string,
    reason?: string,
    auditContext: AuditContextValue = {},
  ) {
    const existing = await this.prisma.playlist.findFirst({ where: { id } })
    if (!existing) throw new PlaylistNotFoundException(id)
    if (!existing.deletedAt) throw new PlaylistNotDeletedException(id)

    return await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.playlist.updateMany({
        where: { id, deletedAt: { not: null } },
        data: { deletedAt: null },
      })
      if (count === 0) throw new PlaylistNotDeletedException(id)

      const updated = await tx.playlist.findFirstOrThrow({
        where: { id },
        select: PLAYLIST_ROW_SELECT,
      })
      await writeTakeDownAudit({
        tx,
        entityType: AUDIT_ENTITY_TYPE,
        entityId: id,
        action: 'admin-playlists.restore',
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
