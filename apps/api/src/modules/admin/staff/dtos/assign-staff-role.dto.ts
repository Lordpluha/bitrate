import { PERMISSIONS } from '@modules/admin-auth'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const AssignStaffRoleSchema = z.object({
  roleId: z.string().uuid(),
  permissions: z.array(z.enum(PERMISSIONS)).optional(),
})

export class AssignStaffRoleDto extends createZodDto(AssignStaffRoleSchema) {}
