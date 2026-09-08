import { z } from 'zod'

/**
 * Hand-written rather than generated: `@bitrate/contracts` is produced from the running API's
 * Swagger, and these endpoints did not exist when this app was started. Revisit once the admin
 * module ships and the generator has something to read — see ADR-0035.
 */
/** Not exported: only `Staff.role` consumes it, through `staffSchema`. */
const staffRoleSchema = z.enum(['ADMIN', 'MODERATOR'])

export const staffSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  username: z.string(),
  role: staffRoleSchema,
})

export type Staff = z.infer<typeof staffSchema>

export const loginRequestSchema = z.object({
  email: z.string().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
  password: z.string().min(1, 'Password is required'),
})

export type LoginRequest = z.infer<typeof loginRequestSchema>
