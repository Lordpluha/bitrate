import { paginationQuerySchema } from '@common/pagination'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const TRACK_PROCESSING_STATUSES = ['PROCESSING', 'READY', 'FAILED'] as const

export const ListAdminTracksQuerySchema = paginationQuerySchema.extend({
  processingStatus: z.enum(TRACK_PROCESSING_STATUSES).optional(),
  q: z.string().min(1).max(255).optional(),
})

export class ListAdminTracksQueryDto extends createZodDto(ListAdminTracksQuerySchema) {}
