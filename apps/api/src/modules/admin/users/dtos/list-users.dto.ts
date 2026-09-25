import { paginationQuerySchema } from '@common/pagination'
import { sortQuerySchema } from '@common/sort'
import { adminResourceStatusSchema } from '@modules/admin/shared'
import type { Prisma } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/** Fields an operator can sort the listener directory by — all displayed, all cheap to order. */
export const ADMIN_USERS_SORT_FIELDS = [
  'username',
  'email',
  'createdAt',
] as const satisfies readonly Prisma.UserScalarFieldEnum[]

export const ListAdminUsersQuerySchema = paginationQuerySchema
  .merge(sortQuerySchema(ADMIN_USERS_SORT_FIELDS))
  .extend({
    status: adminResourceStatusSchema.optional(),
    q: z.string().min(1).max(255).optional(),
  })

export class ListAdminUsersQueryDto extends createZodDto(ListAdminUsersQuerySchema) {}
