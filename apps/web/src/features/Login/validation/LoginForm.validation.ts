import { emailSchema } from '@shared/validation'
import z from 'zod'

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

export type LoginFormData = z.infer<typeof loginSchema>
