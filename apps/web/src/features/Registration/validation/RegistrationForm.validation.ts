import { emailSchema, fullNameSchema, passwordSchema } from '@shared/validation'
import z from 'zod'

export const registrationSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  })

export type RegistrationFormData = z.infer<typeof registrationSchema>
