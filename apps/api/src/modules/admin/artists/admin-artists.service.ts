import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@common/pagination'
import { buildSortOrderBy, type SortInput } from '@common/sort'
import { PrismaService } from '@infra/prisma/prisma.service'
import type { AdminResourceStatus, AuditContextValue } from '@modules/admin/shared'
import { isoOrNull, writeTakeDownAudit } from '@modules/admin/shared'
import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { ADMIN_ARTIST_SAFE_SELECT } from './artist.select'
import type { ADMIN_ARTISTS_SORT_FIELDS, UpdateArtistVerificationDto } from './dtos'
import {
  ArtistAlreadyDeletedException,
  ArtistNotDeletedException,
  ArtistNotFoundException,
} from './errors'

/** One of the artist directory's allowed sort fields. */
type AdminArtistsSortField = (typeof ADMIN_ARTISTS_SORT_FIELDS)[number]

/** Input for listing operator-facing artists. */
type ListArtistsInput = {
  page?: number
  limit?: number
  verified?: boolean
  status?: AdminResourceStatus
  q?: string
} & SortInput<AdminArtistsSortField>

/** Handles the operator-facing artist directory. */
@Injectable()
export class AdminArtistsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Builds the `deletedAt` half of the `where` clause for the `status` take-down filter. */
  private buildStatusWhere(status: AdminResourceStatus = 'active') {
    if (status === 'all') return {}
    if (status === 'deactivated') return { deletedAt: { not: null } }
    return { deletedAt: null }
  }

  /** Builds the shared `where` clause for listing and counting. */
  private buildWhere({ verified, status, q }: Omit<ListArtistsInput, 'page' | 'limit'>) {
    return {
      ...this.buildStatusWhere(status),
      ...(verified !== undefined && { verified }),
      ...(q && {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      }),
    } satisfies Prisma.ArtistWhereInput
  }

  /** Runs the find all operation, paginated and optionally filtered. */
  async findAll({
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    verified,
    status,
    q,
    sort,
    order,
  }: ListArtistsInput) {
    const where = this.buildWhere({ verified, status, q })
    const orderBy = buildSortOrderBy({ sort, order }, [{ createdAt: 'desc' }, { id: 'desc' }])
    const [data, total] = await Promise.all([
      this.prisma.artist.findMany({
        where,
        select: ADMIN_ARTIST_SAFE_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: orderBy as unknown as Prisma.ArtistOrderByWithRelationInput[],
      }),
      this.prisma.artist.count({ where }),
    ])
    return { data, total, page, limit }
  }

  /**
   * Runs the find by id operation, with tracks/albums/session summaries for the detail page.
   * Deliberately does not filter `deletedAt` — a deactivated artist must stay reachable by id
   * so the operator can review the account before deciding to restore it.
   */
  async findById(id: string) {
    const artist = await this.prisma.artist.findFirst({
      where: { id },
      select: ADMIN_ARTIST_SAFE_SELECT,
    })
    if (!artist) throw new ArtistNotFoundException(id)

    const [trackCount, albumCount, activeSessionCount, openReportCount] = await Promise.all([
      this.prisma.track.count({ where: { artistId: id, deletedAt: null } }),
      this.prisma.album.count({ where: { artistId: id, deletedAt: null } }),
      this.prisma.artistSession.count({ where: { artistId: id, expiresAt: { gt: new Date() } } }),
      this.prisma.moderationReport.count({
        where: { entityType: 'artist', entityId: id, status: 'OPEN' },
      }),
    ])

    return {
      ...artist,
      counts: {
        tracks: trackCount,
        albums: albumCount,
        activeSessions: activeSessionCount,
        openReports: openReportCount,
      },
    }
  }

  /** Runs the update verification operation. */
  async updateVerification(id: string, dto: UpdateArtistVerificationDto) {
    const existing = await this.prisma.artist.findFirst({ where: { id } })
    if (!existing) throw new ArtistNotFoundException(id)
    if (existing.deletedAt) throw new ArtistAlreadyDeletedException(id)

    return await this.prisma.artist.update({
      where: { id },
      data: { verified: dto.verified },
      select: ADMIN_ARTIST_SAFE_SELECT,
    })
  }

  /**
   * Soft-deletes an artist, recording the operator's stated reason in an audit row.
   *
   * The write is an `updateMany` scoped to `deletedAt: null` inside the transaction, not a
   * plain `update` — two concurrent take-down requests for the same artist would otherwise
   * both "succeed", the second silently re-stamping `deletedAt` and re-writing an audit row
   * for an action that already happened. A `count` of 0 means someone else won the race, which
   * is a 409, not the 404 a genuinely missing artist gets.
   *
   * Also revokes every active session in the same transaction — a take-down that leaves
   * existing sessions live would let the account keep acting until every token happened to
   * expire on its own; see `ArtistsAuthGuard` for the request-time half of this fix.
   */
  async softDelete(
    id: string,
    staffId: string,
    reason?: string,
    auditContext: AuditContextValue = {},
  ) {
    const existing = await this.prisma.artist.findFirst({ where: { id } })
    if (!existing) throw new ArtistNotFoundException(id)
    if (existing.deletedAt) throw new ArtistAlreadyDeletedException(id)

    return await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.artist.updateMany({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
      })
      if (count === 0) throw new ArtistAlreadyDeletedException(id)

      const { count: sessionsRevoked } = await tx.artistSession.deleteMany({
        where: { artistId: id },
      })
      const updated = await tx.artist.findFirstOrThrow({
        where: { id },
        select: ADMIN_ARTIST_SAFE_SELECT,
      })
      await writeTakeDownAudit({
        tx,
        entityType: 'admin-artists',
        entityId: id,
        action: 'admin-artists.delete',
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
   * Restores a soft-deleted artist, recording the operator's stated reason in an audit row.
   * Uses the same `updateMany` + count-guard pattern as {@link softDelete} for the same
   * concurrent-request reason.
   */
  async restore(
    id: string,
    staffId: string,
    reason?: string,
    auditContext: AuditContextValue = {},
  ) {
    const existing = await this.prisma.artist.findFirst({ where: { id } })
    if (!existing) throw new ArtistNotFoundException(id)
    if (!existing.deletedAt) throw new ArtistNotDeletedException(id)

    return await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.artist.updateMany({
        where: { id, deletedAt: { not: null } },
        data: { deletedAt: null },
      })
      if (count === 0) throw new ArtistNotDeletedException(id)

      const updated = await tx.artist.findFirstOrThrow({
        where: { id },
        select: ADMIN_ARTIST_SAFE_SELECT,
      })
      await writeTakeDownAudit({
        tx,
        entityType: 'admin-artists',
        entityId: id,
        action: 'admin-artists.restore',
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
   * Revokes every active session for an artist, signing them out on their next request — an
   * already-open WebSocket connection is unaffected until it disconnects; see the changeset
   * for that known limitation.
   */
  async revokeSessions(
    id: string,
    staffId: string,
    reason?: string,
    auditContext: AuditContextValue = {},
  ) {
    const existing = await this.prisma.artist.findFirst({ where: { id } })
    if (!existing) throw new ArtistNotFoundException(id)

    return await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.artistSession.deleteMany({ where: { artistId: id } })
      await writeTakeDownAudit({
        tx,
        entityType: 'admin-artists',
        entityId: id,
        action: 'admin-artists.revoke-sessions',
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
