import { z } from 'zod'

/** Email plus the six-digit code from the verification email. */
export const verificationSchema = z.object({
  email: z.email('Please enter a valid email address'),
  code: z.string().regex(/^\d{6}$/, 'Enter the six-digit code'),
})

export type VerificationFormData = z.infer<typeof verificationSchema>
