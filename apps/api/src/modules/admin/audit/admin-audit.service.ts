import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@common/pagination'
import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import type { AuditLog, Prisma } from '@prisma/client'
import type { ListAdminAuditLogsQueryDto } from './dtos'

/** An audit log row with its actor resolved to a display username. */
type AdminAuditLogRow = AuditLog & { actorUsername: string | null }

/**
 * Handles the operator-facing audit log.
 *
 * Resolves each row's actor (staff or user) to a display username in two batched
 * lookups per page — never one query per row.
 */
@Injectable()
export class AdminAuditService {
  constructor(private readonly prisma: PrismaService) {}

  /** Builds the shared `where` clause for listing and counting. */
  private buildWhere({ entityType, staffId, from, to }: ListAdminAuditLogsQueryDto) {
    return {
      ...(entityType && { entityType }),
      ...(staffId && { staffId }),
      ...((from || to) && {
        createdAt: {
          ...(from && { gte: from }),
          ...(to && { lte: to }),
        },
      }),
    } satisfies Prisma.AuditLogWhereInput
  }

  /** Runs the find all operation, paginated, newest first. */
  async findAll(query: ListAdminAuditLogsQueryDto) {
    const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = query
    const where = this.buildWhere(query)

    const [rows, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.auditLog.count({ where }),
    ])

    const data = await this.resolveActors(rows)
    return { data, total, page, limit }
  }

  /** Batch-resolves every row's `staffId`/`userId` to a display username. */
  private async resolveActors(rows: AuditLog[]): Promise<AdminAuditLogRow[]> {
    const staffIds = [...new Set(rows.map((row) => row.staffId).filter((id): id is string => !!id))]
    const userIds = [...new Set(rows.map((row) => row.userId).filter((id): id is string => !!id))]

    type ActorRow = { id: string; username: string }

    const [staffRows, userRows] = await Promise.all([
      staffIds.length > 0
        ? this.prisma.staff.findMany({
            where: { id: { in: staffIds } },
            select: { id: true, username: true },
          })
        : Promise.resolve([] as ActorRow[]),
      userIds.length > 0
        ? this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, username: true },
          })
        : Promise.resolve([] as ActorRow[]),
    ])

    const staffUsernameById = new Map<string, string>(
      staffRows.map((staff): [string, string] => [staff.id, staff.username]),
    )
    const userUsernameById = new Map<string, string>(
      userRows.map((user): [string, string] => [user.id, user.username]),
    )

    return rows.map((row) => ({
      ...row,
      actorUsername: row.staffId
        ? (staffUsernameById.get(row.staffId) ?? null)
        : row.userId
          ? (userUsernameById.get(row.userId) ?? null)
          : null,
    }))
  }
}
