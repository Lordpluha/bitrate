import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const MODERATION_STATUSES = ['OPEN', 'REVIEWING', 'RESOLVED', 'REJECTED'] as const

export const ListReportsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(MODERATION_STATUSES).optional(),
})

export class ListReportsQueryDto extends createZodDto(ListReportsQuerySchema) {}
