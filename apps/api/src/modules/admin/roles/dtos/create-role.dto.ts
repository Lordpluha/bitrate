import { PERMISSIONS } from '@modules/admin-auth'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const CreateRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  permissions: z.array(z.enum(PERMISSIONS)).default([]),
})

export class CreateRoleDto extends createZodDto(CreateRoleSchema) {}
