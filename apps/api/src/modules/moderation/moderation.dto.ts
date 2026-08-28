import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const MODERATION_ENTITY_TYPES = [
  'track',
  'album',
  'playlist',
  'artist',
  'podcast',
  'episode',
  'user',
] as const

export const CreateReportSchema = z.object({
  entityType: z.enum(MODERATION_ENTITY_TYPES),
  entityId: z.uuid(),
  reason: z.string().trim().min(3).max(100),
  details: z.string().trim().min(1).max(2_000).optional(),
})

export class CreateReportDto extends createZodDto(CreateReportSchema) {}
