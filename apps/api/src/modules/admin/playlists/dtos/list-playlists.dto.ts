import { paginationQuerySchema } from '@common/pagination'
import { sortQuerySchema } from '@common/sort'
import { adminResourceStatusSchema } from '@modules/admin/shared'
import type { Prisma } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/** Fields an operator can sort the playlist list by — all displayed, all cheap to order. */
export const ADMIN_PLAYLISTS_SORT_FIELDS = [
  'createdAt',
  'title',
] as const satisfies readonly Prisma.PlaylistScalarFieldEnum[]

export const ListAdminPlaylistsQuerySchema = paginationQuerySchema
  .merge(sortQuerySchema(ADMIN_PLAYLISTS_SORT_FIELDS))
  .extend({
    status: adminResourceStatusSchema.optional(),
    ownerId: z.string().uuid().optional(),
    q: z.string().min(1).max(255).optional(),
  })

export class ListAdminPlaylistsQueryDto extends createZodDto(ListAdminPlaylistsQuerySchema) {}
