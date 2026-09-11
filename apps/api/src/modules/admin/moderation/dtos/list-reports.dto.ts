import { paginationQuerySchema } from '@common/pagination'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const MODERATION_STATUSES = ['OPEN', 'REVIEWING', 'RESOLVED', 'REJECTED'] as const

export const ListReportsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(MODERATION_STATUSES).optional(),
})

export class ListReportsQueryDto extends createZodDto(ListReportsQuerySchema) {}
