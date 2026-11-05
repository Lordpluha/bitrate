import type { Prisma } from '@prisma/client'
import type { ListAdminAuditLogsQueryDto } from '../dtos'

/** The audit log list's `where` clause, shared by listing and counting. */
export const auditLogListWhere = ({
  entityType,
  entityId,
  staffId,
  from,
  to,
}: ListAdminAuditLogsQueryDto) =>
  ({
    ...(entityType && { entityType }),
    ...(entityId && { entityId }),
    ...(staffId && { staffId }),
    ...((from || to) && {
      createdAt: {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
      },
    }),
  }) satisfies Prisma.AuditLogWhereInput
