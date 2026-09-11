import { z } from 'zod'

export const loginSchema = z.object({
  /**
   * Piped rather than chained: zod 4 deprecates `.email()` on a string, and a bare `z.email()`
   * would answer an empty field with "invalid email" instead of "required".
   */
  email: z
    .string()
    .min(1, 'Email is required')
    .pipe(z.email('Please enter a valid email address')),
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormData = z.infer<typeof loginSchema>
