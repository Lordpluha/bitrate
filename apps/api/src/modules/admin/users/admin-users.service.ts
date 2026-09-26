import { DEFAULT_LIMIT, DEFAULT_PAGE, type PaginationInput } from '@common/pagination'
import { buildSortOrderBy, type SortInput } from '@common/sort'
import { PrismaService } from '@infra/prisma/prisma.service'
import type { AdminResourceStatus, AuditContextValue } from '@modules/admin/shared'
import { isoOrNull, writeTakeDownAudit } from '@modules/admin/shared'
import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import type { ADMIN_USERS_SORT_FIELDS } from './dtos'
import {
  UserAlreadyDeletedException,
  UserNotDeletedException,
  UserNotFoundException,
} from './errors'
import { ADMIN_USER_SAFE_SELECT } from './user.select'

/** One of the listener directory's allowed sort fields. */
type AdminUsersSortField = (typeof ADMIN_USERS_SORT_FIELDS)[number]

/** Input for listing operator-facing users. */
type ListUsersInput = {
  page?: number
  limit?: number
  status?: AdminResourceStatus
  q?: string
} & SortInput<AdminUsersSortField>

/** Handles the operator-facing user directory. */
@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Builds the `deletedAt` half of the `where` clause for the `status` take-down filter. */
  private buildStatusWhere(status: AdminResourceStatus = 'active') {
    if (status === 'all') return {}
    if (status === 'deactivated') return { deletedAt: { not: null } }
    return { deletedAt: null }
  }

  /** Builds the shared `where` clause for listing and counting. */
  private buildWhere({ status, q }: Omit<ListUsersInput, 'page' | 'limit'>) {
    return {
      ...this.buildStatusWhere(status),
      ...(q && {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      }),
    } satisfies Prisma.UserWhereInput
  }

  /** Runs the find all operation, paginated and optionally filtered. */
  async findAll({
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    status,
    q,
    sort,
    order,
  }: ListUsersInput) {
    const where = this.buildWhere({ status, q })
    const orderBy = buildSortOrderBy({ sort, order }, [{ createdAt: 'desc' }, { id: 'desc' }])
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: ADMIN_USER_SAFE_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: orderBy as unknown as Prisma.UserOrderByWithRelationInput[],
      }),
      this.prisma.user.count({ where }),
    ])
    return { data, total, page, limit }
  }

  /**
   * Runs the find by id operation, with activity counts for the detail page. Deliberately does
   * not filter `deletedAt` — a deactivated listener must stay reachable by id so the operator
   * can review the account before deciding to restore it.
   */
  async findById(id: string) {
    const user = await this.prisma.user.findFirst({ where: { id }, select: ADMIN_USER_SAFE_SELECT })
    if (!user) throw new UserNotFoundException(id)

    const [
      playlistCount,
      likedTrackCount,
      listeningHistoryCount,
      reportsFiledCount,
      activeSessionCount,
    ] = await Promise.all([
      this.prisma.playlist.count({ where: { userId: id, deletedAt: null } }),
      this.prisma.userLikedTrack.count({ where: { userId: id } }),
      this.prisma.listeningHistory.count({ where: { userId: id } }),
      this.prisma.moderationReport.count({ where: { reporterId: id } }),
      this.prisma.userSession.count({ where: { userId: id, expiresAt: { gt: new Date() } } }),
    ])

    return {
      ...user,
      counts: {
        playlists: playlistCount,
        likedTracks: likedTrackCount,
        listeningHistory: listeningHistoryCount,
        reportsFiled: reportsFiledCount,
        activeSessions: activeSessionCount,
      },
    }
  }

  /**
   * Runs the list listening history operation, newest first. Deliberately does not filter
   * `deletedAt` — a deactivated listener's history stays reachable, matching {@link findById}.
   * An empty history is a valid empty page, not a 404; a missing user is.
   */
  async findListeningHistory(
    id: string,
    { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT }: PaginationInput,
  ) {
    const existing = await this.prisma.user.findFirst({ where: { id } })
    if (!existing) throw new UserNotFoundException(id)

    const [rows, total] = await Promise.all([
      this.prisma.listeningHistory.findMany({
        where: { userId: id },
        select: {
          id: true,
          listenedAt: true,
          track: { select: { id: true, title: true, artist: { select: { username: true } } } },
        },
        orderBy: [{ listenedAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.listeningHistory.count({ where: { userId: id } }),
    ])

    return {
      data: rows.map((row) => ({
        id: row.id,
        listenedAt: row.listenedAt,
        trackId: row.track.id,
        trackTitle: row.track.title,
        artistUsername: row.track.artist.username,
      })),
      total,
      page,
      limit,
    }
  }

  /**
   * Soft-deletes a user, recording the operator's stated reason in an audit row.
   *
   * The write is an `updateMany` scoped to `deletedAt: null` inside the transaction, not a
   * plain `update` — two concurrent take-down requests for the same user would otherwise both
   * "succeed", the second silently re-stamping `deletedAt` and re-writing an audit row for an
   * action that already happened. A `count` of 0 means someone else won the race, which is a
   * 409, not the 404 a genuinely missing user gets.
   *
   * Also revokes every active session in the same transaction — a take-down that leaves
   * existing sessions live would let the account keep acting until every token happened to
   * expire on its own; see `UserAuthGuard` for the request-time half of this fix.
   */
  async softDelete(
    id: string,
    staffId: string,
    reason?: string,
    auditContext: AuditContextValue = {},
  ) {
    const existing = await this.prisma.user.findFirst({ where: { id } })
    if (!existing) throw new UserNotFoundException(id)
    if (existing.deletedAt) throw new UserAlreadyDeletedException(id)

    return await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.user.updateMany({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
      })
      if (count === 0) throw new UserAlreadyDeletedException(id)

      const { count: sessionsRevoked } = await tx.userSession.deleteMany({
        where: { userId: id },
      })
      const updated = await tx.user.findFirstOrThrow({
        where: { id },
        select: ADMIN_USER_SAFE_SELECT,
      })
      await writeTakeDownAudit({
        tx,
        entityType: 'admin-users',
        entityId: id,
        action: 'admin-users.delete',
        staffId,
        reason,
        before: { deletedAt: isoOrNull(existing.deletedAt) },
        after: { deletedAt: isoOrNull(updated.deletedAt), sessionsRevoked },
        ...auditContext,
      })
      return updated
    })
  }

  /**
   * Restores a soft-deleted user, recording the operator's stated reason in an audit row.
   * Uses the same `updateMany` + count-guard pattern as {@link softDelete} for the same
   * concurrent-request reason.
   */
  async restore(
    id: string,
    staffId: string,
    reason?: string,
    auditContext: AuditContextValue = {},
  ) {
    const existing = await this.prisma.user.findFirst({ where: { id } })
    if (!existing) throw new UserNotFoundException(id)
    if (!existing.deletedAt) throw new UserNotDeletedException(id)

    return await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.user.updateMany({
        where: { id, deletedAt: { not: null } },
        data: { deletedAt: null },
      })
      if (count === 0) throw new UserNotDeletedException(id)

      const updated = await tx.user.findFirstOrThrow({
        where: { id },
        select: ADMIN_USER_SAFE_SELECT,
      })
      await writeTakeDownAudit({
        tx,
        entityType: 'admin-users',
        entityId: id,
        action: 'admin-users.restore',
        staffId,
        reason,
        before: { deletedAt: isoOrNull(existing.deletedAt) },
        after: { deletedAt: isoOrNull(updated.deletedAt) },
        ...auditContext,
      })
      return updated
    })
  }

  /**
   * Revokes every active session for a user, signing them out on their next request — an
   * already-open WebSocket connection is unaffected until it disconnects; see the changeset
   * for that known limitation.
   */
  async revokeSessions(
    id: string,
    staffId: string,
    reason?: string,
    auditContext: AuditContextValue = {},
  ) {
    const existing = await this.prisma.user.findFirst({ where: { id } })
    if (!existing) throw new UserNotFoundException(id)

    return await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.userSession.deleteMany({ where: { userId: id } })
      await writeTakeDownAudit({
        tx,
        entityType: 'admin-users',
        entityId: id,
        action: 'admin-users.revoke-sessions',
        staffId,
        reason,
        before: {},
        after: { sessionsRevoked: count },
        ...auditContext,
      })
      return { revoked: count }
    })
  }
}
