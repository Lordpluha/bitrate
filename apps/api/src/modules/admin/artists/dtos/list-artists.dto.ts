import { paginationQuerySchema } from '@common/pagination'
import { sortQuerySchema } from '@common/sort'
import { adminResourceStatusSchema } from '@modules/admin/shared'
import type { Prisma } from '@prisma/client'
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

/** Fields an operator can sort the artist directory by — all displayed, all cheap to order. */
export const ADMIN_ARTISTS_SORT_FIELDS = [
  'username',
  'email',
  'createdAt',
  'monthlyListeners',
] as const satisfies readonly Prisma.ArtistScalarFieldEnum[]

export const ListAdminArtistsQuerySchema = paginationQuerySchema
  .merge(sortQuerySchema(ADMIN_ARTISTS_SORT_FIELDS))
  .extend({
    verified: booleanQueryParam.optional(),
    status: adminResourceStatusSchema.optional(),
    q: z.string().min(1).max(255).optional(),
  })

export class ListAdminArtistsQueryDto extends createZodDto(ListAdminArtistsQuerySchema) {}
