import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/** A colour stored as data: `#rrggbb`. Not a design token. */
export const genreColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Expected a #rrggbb colour')

/** A lowercase URL slug: letters/digits separated by single hyphens. */
export const genreSlugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Expected lowercase letters, digits and hyphens')

export const CreateGenreSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: genreSlugSchema.optional(),
  description: z.string().max(1000).nullable().optional(),
  color: genreColorSchema.nullable().optional(),
})

export class CreateGenreDto extends createZodDto(CreateGenreSchema) {}
