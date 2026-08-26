import { emailSchema, fullNameSchema, passwordSchema } from '@shared/validation'
import z from 'zod'

const loginPasswordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(32, 'Password must not exceed 32 characters')

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registrationSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type RegistrationFormData = z.infer<typeof registrationSchema>
