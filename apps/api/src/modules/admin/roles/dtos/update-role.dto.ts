import { PERMISSIONS } from '@modules/admin-auth'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const UpdateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  permissions: z.array(z.enum(PERMISSIONS)).optional(),
})

export class UpdateRoleDto extends createZodDto(UpdateRoleSchema) {}
