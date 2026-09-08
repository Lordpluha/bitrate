import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const TRACK_PROCESSING_STATUSES = ['PROCESSING', 'READY', 'FAILED'] as const

export const ListAdminTracksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  processingStatus: z.enum(TRACK_PROCESSING_STATUSES).optional(),
  q: z.string().min(1).max(255).optional(),
})

export class ListAdminTracksQueryDto extends createZodDto(ListAdminTracksQuerySchema) {}
