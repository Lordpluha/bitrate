import { emailSchema, fullNameSchema, passwordSchema } from '@shared/validation'
import z from 'zod'

const loginPasswordSchema = z
  .string()
  .min(6, 'validation.loginPassword.min')
  .max(32, 'validation.loginPassword.max')

/**
 * The "I am 16+ and accept the Terms, Community Guidelines and Privacy Policy" box. Every form
 * that sends credentials requires it; the form keeps it out of the request body.
 */
const legalAcceptanceSchema = z
  .boolean({ error: 'validation.legal.required' })
  .refine((accepted) => accepted, 'validation.legal.required')

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
  acceptLegal: legalAcceptanceSchema,
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registrationSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
    acceptLegal: legalAcceptanceSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'validation.password.mismatch',
    path: ['confirmPassword'],
  })

export type RegistrationFormData = z.infer<typeof registrationSchema>
