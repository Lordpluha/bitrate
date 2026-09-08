import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const ListAdminUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().min(1).max(255).optional(),
})

export class ListAdminUsersQueryDto extends createZodDto(ListAdminUsersQuerySchema) {}
