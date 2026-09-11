import { paginationQuerySchema } from '@common/pagination'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const ListAdminUsersQuerySchema = paginationQuerySchema.extend({
  q: z.string().min(1).max(255).optional(),
})

export class ListAdminUsersQueryDto extends createZodDto(ListAdminUsersQuerySchema) {}
