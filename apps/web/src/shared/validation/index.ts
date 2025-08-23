import { z } from 'zod'


export const emailSchema = z.string().email('Invalid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .refine((val) => /[a-z]/.test(val), {
    message: 'Password must include at least one lowercase letter',
  })
  .refine((val) => /[A-Z]/.test(val), {
    message: 'Password must include at least one uppercase letter',
  })
  .refine((val) => /\d/.test(val), {
    message: 'Password must include at least one number',
  })
  .refine((val) => /[@$!%*?&]/.test(val), {
    message: 'Password must include at least one special character',
  })

export const fullNameSchema = z
  .string()
  .min(2, 'Too short')
  .max(30, 'Max length is 30 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Only letters and spaces allowed')


export const loginPasswordSchema = z.string().min(1, 'Password is required')


export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
})

export const registrationSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })


export type LoginFormData = z.infer<typeof loginSchema>
export type RegistrationFormData = z.infer<typeof registrationSchema>
