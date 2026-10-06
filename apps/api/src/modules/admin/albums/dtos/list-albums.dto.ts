import { paginationQuerySchema } from '@common/pagination'
import { sortQuerySchema } from '@common/sort'
import { adminResourceStatusSchema } from '@modules/admin/shared'
import type { Prisma } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/** Fields an operator can sort the album list by — all displayed, all cheap to order. */
export const ADMIN_ALBUMS_SORT_FIELDS = [
  'createdAt',
  'title',
  'releaseDate',
] as const satisfies readonly Prisma.AlbumScalarFieldEnum[]

export const ListAdminAlbumsQuerySchema = paginationQuerySchema
  .merge(sortQuerySchema(ADMIN_ALBUMS_SORT_FIELDS))
  .extend({
    status: adminResourceStatusSchema.optional(),
    artistId: z.string().uuid().optional(),
    q: z.string().min(1).max(255).optional(),
  })

export class ListAdminAlbumsQueryDto extends createZodDto(ListAdminAlbumsQuerySchema) {}
