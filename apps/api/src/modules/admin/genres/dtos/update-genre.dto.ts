import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { genreColorSchema, genreSlugSchema } from './create-genre.dto'

export const UpdateGenreSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  slug: genreSlugSchema.optional(),
  description: z.string().max(1000).nullable().optional(),
  color: genreColorSchema.nullable().optional(),
})

export class UpdateGenreDto extends createZodDto(UpdateGenreSchema) {}
