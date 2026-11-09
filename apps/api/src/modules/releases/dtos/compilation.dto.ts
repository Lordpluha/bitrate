import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { ReleaseDraftVersionSchema } from './release-media.dto'

export const CompilationCatalogueSchema = z.strictObject({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  search: z.string().trim().max(255).optional(),
})
export class CompilationCatalogueDto extends createZodDto(CompilationCatalogueSchema) {}
export const AddCompilationTracksSchema = ReleaseDraftVersionSchema.extend({
  trackIds: z
    .array(z.uuid())
    .min(1)
    .max(50)
    .refine((ids) => new Set(ids).size === ids.length),
})
export class AddCompilationTracksDto extends createZodDto(AddCompilationTracksSchema) {}
