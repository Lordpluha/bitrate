import z from 'zod'

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

export const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/[0-9]|[^A-Za-z0-9]/, 'Password must contain a number or special character')

export const registrationSchema = z
  .object({
    email: emailSchema,
    password: z.string(),
  })
  .refine((data) => !data.password || data.password.length >= 10, {
    message: 'Password must be at least 10 characters',
    path: ['password'],
  })
  .refine((data) => !data.password || /[A-Za-z]/.test(data.password), {
    message: 'Password must contain at least one letter',
    path: ['password'],
  })
  .refine((data) => !data.password || /[0-9]|[^A-Za-z0-9]/.test(data.password), {
    message: 'Password must contain a number or special character',
    path: ['password'],
  })

export type RegistrationFormData = z.infer<typeof registrationSchema>
