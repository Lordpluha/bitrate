import { PERMISSIONS } from '@modules/admin-auth'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/** Matches `seed-staff.ts`'s own minimum — operator passwords are never allowed to be weaker. */
const MIN_PASSWORD_LENGTH = 12

export const CreateStaffSchema = z.object({
  email: z.string().email(),
  username: z.string().min(1).max(100),
  password: z.string().min(MIN_PASSWORD_LENGTH),
  roleId: z.string().uuid(),
  permissions: z.array(z.enum(PERMISSIONS)).optional(),
})

export class CreateStaffDto extends createZodDto(CreateStaffSchema) {}
