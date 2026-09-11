import { paginationQuerySchema } from '@common/pagination'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/** Coerces the `true`/`false` query string into a real boolean — `z.coerce.boolean()`
 * treats any non-empty string (including `"false"`) as truthy, which is wrong for a
 * query param. */
const booleanQueryParam = z.preprocess((value) => {
  if (value === 'true') return true
  if (value === 'false') return false
  return value
}, z.boolean())

export const ListAdminArtistsQuerySchema = paginationQuerySchema.extend({
  verified: booleanQueryParam.optional(),
  q: z.string().min(1).max(255).optional(),
})

export class ListAdminArtistsQueryDto extends createZodDto(ListAdminArtistsQuerySchema) {}
