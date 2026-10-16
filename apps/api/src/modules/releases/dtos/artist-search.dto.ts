import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const ArtistSearchSchema = z.strictObject({
  q: z.string().trim().min(2).max(100).describe('Text to find in titles'),
})

export class ArtistSearchDto extends createZodDto(ArtistSearchSchema) {}
