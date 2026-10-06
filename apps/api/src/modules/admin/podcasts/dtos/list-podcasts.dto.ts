import { paginationQuerySchema } from '@common/pagination'
import { sortQuerySchema } from '@common/sort'
import { adminResourceStatusSchema } from '@modules/admin/shared'
import type { Prisma } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/** Fields an operator can sort the podcast list by — all displayed, all indexed or cheap. */
export const ADMIN_PODCASTS_SORT_FIELDS = [
  'createdAt',
  'title',
] as const satisfies readonly Prisma.PodcastScalarFieldEnum[]

export const ListAdminPodcastsQuerySchema = paginationQuerySchema
  .merge(sortQuerySchema(ADMIN_PODCASTS_SORT_FIELDS))
  .extend({
    status: adminResourceStatusSchema.optional(),
    q: z.string().min(1).max(255).optional(),
  })

export class ListAdminPodcastsQueryDto extends createZodDto(ListAdminPodcastsQuerySchema) {}
