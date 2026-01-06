import { emailSchema, passwordSchema } from '@shared/validation'
import z from 'zod'

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export type LoginFormData = z.infer<typeof loginSchema>
