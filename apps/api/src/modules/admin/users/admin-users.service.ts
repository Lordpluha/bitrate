import { DEFAULT_LIMIT, DEFAULT_PAGE, type PaginationInput } from '@common/pagination'
import { buildSortOrderBy, type SortInput } from '@common/sort'
import { PrismaService } from '@infra/prisma/prisma.service'
import type { AdminResourceStatus, AuditContextValue, CsvExport } from '@modules/admin/shared'
import {
  type AdminRevokeSessionsResultEntity,
  openCsvExport,
  revokeAccountSessions,
  runBatch,
  runTakeDownTransition,
  statusWhere,
  type TakeDownActor,
  type TakeDownDirection,
} from '@modules/admin/shared'
import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import type { ADMIN_USERS_SORT_FIELDS } from './dtos'
import {
  UserAlreadyDeletedException,
  UserNotDeletedException,
  UserNotFoundException,
} from './errors'
import {
  ADMIN_USER_EXPORT_COLUMNS,
  ADMIN_USER_EXPORT_SELECT,
  ADMIN_USER_SAFE_SELECT,
} from './user.select'

/** One of the listener directory's allowed sort fields. */
type AdminUsersSortField = (typeof ADMIN_USERS_SORT_FIELDS)[number]

/** Input for listing operator-facing users. */
type ListUsersInput = {
  page?: number
  limit?: number
  status?: AdminResourceStatus
  q?: string
} & SortInput<AdminUsersSortField>

/** A user as the operator sees it — the safe columns only. */
type AdminUserRow = Prisma.UserGetPayload<{ select: typeof ADMIN_USER_SAFE_SELECT }>

/** Handles the operator-facing user directory. */
@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Builds the shared `where` clause for listing and counting. */
  private buildWhere({ status, q }: Omit<ListUsersInput, 'page' | 'limit'>) {
    return {
      ...statusWhere(status),
      ...(q && {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      }),
    } satisfies Prisma.UserWhereInput
  }

  /** Lists users, paginated and optionally filtered. */
  async findAll({
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    status,
    q,
    sort,
    order,
  }: ListUsersInput) {
    const where = this.buildWhere({ status, q })
    const orderBy = buildSortOrderBy<Prisma.UserOrderByWithRelationInput>({ sort, order }, [
      { createdAt: 'desc' },
      { id: 'desc' },
    ])
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: ADMIN_USER_SAFE_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      this.prisma.user.count({ where }),
    ])
    return { data, total, page, limit }
  }

  /**
   * Streams every user matching the list's filters and sort as CSV (capped, see
   * `CSV_EXPORT_MAX_ROWS`). Uses the list's `where` and ordering — with the same id tie-break —
   * so the file holds exactly the rows the list shows across all its pages. Batches are paged by
   * offset in that order; nothing is held beyond the current batch.
   */
  async exportCsv(
    { status, q, sort, order }: Omit<ListUsersInput, 'page' | 'limit'>,
    staffId: string,
    auditContext: AuditContextValue = {},
  ): Promise<CsvExport> {
    const where = this.buildWhere({ status, q })
    const orderBy = buildSortOrderBy<Prisma.UserOrderByWithRelationInput>({ sort, order }, [
      { createdAt: 'desc' },
      { id: 'desc' },
    ])
    const total = await this.prisma.user.count({ where })

    return openCsvExport({
      prisma: this.prisma,
      resource: 'admin-users',
      staffId,
      filters: { status, q, sort, order },
      auditContext,
      columns: ADMIN_USER_EXPORT_COLUMNS,
      total,
      fetchPage: (skip, take) =>
        this.prisma.user.findMany({
          where,
          select: ADMIN_USER_EXPORT_SELECT,
          orderBy,
          skip,
          take,
        }),
    })
  }

  /**
   * Finds one user by id, with activity counts for the detail page. Deliberately does
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
   * Lists a user's listening history, newest first. Deliberately does not filter
   * `deletedAt` — a deactivated listener's history stays reachable, matching {@link findById}.
   * An empty history is a valid empty page, not a 404; a missing user is.
   */
  async findListeningHistory(
    id: string,
    { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT }: PaginationInput,
  ) {
    const [existing, rows, total] = await Promise.all([
      this.prisma.user.findFirst({ where: { id }, select: { id: true } }),
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
    if (!existing) throw new UserNotFoundException(id)

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
  softDelete(
    id: string,
    staffId: string,
    reason?: string,
    auditContext: AuditContextValue = {},
  ): Promise<AdminUserRow> {
    return this.transition('take-down', id, { staffId, reason, ...auditContext })
  }

  /** Deactivates every id independently via {@link softDelete}; per-id results, same rules. */
  softDeleteMany(ids: readonly string[], staffId: string, auditContext: AuditContextValue = {}) {
    return runBatch(ids, (id) => this.softDelete(id, staffId, undefined, auditContext))
  }

  /**
   * Restores a soft-deleted user, recording the operator's stated reason in an audit row.
   * Uses the same `updateMany` + count-guard pattern as {@link softDelete} for the same
   * concurrent-request reason.
   */
  restore(
    id: string,
    staffId: string,
    reason?: string,
    auditContext: AuditContextValue = {},
  ): Promise<AdminUserRow> {
    return this.transition('restore', id, { staffId, reason, ...auditContext })
  }

  /** Revokes every session of a user — see {@link revokeAccountSessions}. */
  revokeSessions(
    id: string,
    staffId: string,
    reason?: string,
    auditContext: AuditContextValue = {},
  ): Promise<AdminRevokeSessionsResultEntity> {
    return revokeAccountSessions({
      prisma: this.prisma,
      exists: async () =>
        !!(await this.prisma.user.findFirst({ where: { id }, select: { id: true } })),
      notFound: () => new UserNotFoundException(id),
      revoke: (tx) => tx.userSession.deleteMany({ where: { userId: id } }),
      entityType: 'admin-users',
      entityId: id,
      actor: { staffId, reason, ...auditContext },
    })
  }

  /** Takes a user down or restores it, with its audit row — see {@link runTakeDownTransition}. */
  private transition(
    direction: TakeDownDirection,
    id: string,
    actor: TakeDownActor,
  ): Promise<AdminUserRow> {
    const takeDown = direction === 'take-down'
    return runTakeDownTransition({
      prisma: this.prisma,
      direction,
      current: () => this.prisma.user.findFirst({ where: { id }, select: { deletedAt: true } }),
      mark: (tx, guard, data) => tx.user.updateMany({ where: { id, ...guard }, data }),
      extra: takeDown
        ? async (tx) => {
            const { count } = await tx.userSession.deleteMany({ where: { userId: id } })
            return { sessionsRevoked: count }
          }
        : undefined,
      load: (tx) => tx.user.findFirstOrThrow({ where: { id }, select: ADMIN_USER_SAFE_SELECT }),
      notFound: () => new UserNotFoundException(id),
      conflict: () =>
        takeDown ? new UserAlreadyDeletedException(id) : new UserNotDeletedException(id),
      audit: { entityType: 'admin-users', entityId: id, ...actor },
    })
  }
}
