import { paginationQuerySchema } from '@common/pagination'
import { sortQuerySchema } from '@common/sort'
import type { Prisma } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/** The audit log has one meaningful sort axis: `createdAt`, and it is already indexed both
 * on its own and per-actor. `entityType`/`staffId` are filters, not sort keys an operator
 * reading a chronological trail would reach for, and the resolved `actorUsername` isn't a
 * database column at all — it can't be an `orderBy` key. */
export const ADMIN_AUDIT_LOGS_SORT_FIELDS = [
  'createdAt',
] as const satisfies readonly Prisma.AuditLogScalarFieldEnum[]

export const ListAdminAuditLogsQuerySchema = paginationQuerySchema
  .merge(sortQuerySchema(ADMIN_AUDIT_LOGS_SORT_FIELDS))
  .extend({
    entityType: z.string().min(1).max(100).optional(),
    entityId: z.string().uuid().optional(),
    staffId: z.string().uuid().optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine((value) => !(value.from && value.to) || value.from <= value.to, {
    message: '`from` must not be after `to`',
    path: ['from'],
  })

export class ListAdminAuditLogsQueryDto extends createZodDto(ListAdminAuditLogsQuerySchema) {}
