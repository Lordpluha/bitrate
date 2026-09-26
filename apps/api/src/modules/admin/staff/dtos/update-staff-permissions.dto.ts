import { PERMISSIONS } from '@modules/admin-auth'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const UpdateStaffPermissionsSchema = z.object({
  permissions: z.array(z.enum(PERMISSIONS)),
})

export class UpdateStaffPermissionsDto extends createZodDto(UpdateStaffPermissionsSchema) {}
