import { paginationQuerySchema } from '@common/pagination'
import { sortQuerySchema } from '@common/sort'
import type { Prisma } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/** Fields an operator can sort the genre list by. */
export const ADMIN_GENRES_SORT_FIELDS = [
  'name',
  'slug',
  'createdAt',
] as const satisfies readonly Prisma.GenreScalarFieldEnum[]

export const ListAdminGenresQuerySchema = paginationQuerySchema
  .merge(sortQuerySchema(ADMIN_GENRES_SORT_FIELDS))
  .extend({
    q: z.string().min(1).max(255).optional(),
  })

export class ListAdminGenresQueryDto extends createZodDto(ListAdminGenresQuerySchema) {}
