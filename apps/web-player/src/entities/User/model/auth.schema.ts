import { emailSchema, fullNameSchema, passwordSchema } from '@shared/validation'
import z from 'zod'

const loginPasswordSchema = z
  .string()
  .min(6, 'validation.loginPassword.min')
  .max(32, 'validation.loginPassword.max')

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
    acceptLegal: z
      .boolean()
      .refine((accepted) => accepted, 'validation.legal.required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'validation.password.mismatch',
    path: ['confirmPassword'],
  })

export type RegistrationFormData = z.infer<typeof registrationSchema>
