import { paginationQuerySchema } from '@common/pagination'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const ListAdminAuditLogsQuerySchema = paginationQuerySchema
  .extend({
    entityType: z.string().min(1).max(100).optional(),
    staffId: z.string().uuid().optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine((value) => !(value.from && value.to) || value.from <= value.to, {
    message: '`from` must not be after `to`',
    path: ['from'],
  })

export class ListAdminAuditLogsQueryDto extends createZodDto(ListAdminAuditLogsQuerySchema) {}
