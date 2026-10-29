import { messageKey } from '@shared/i18n'
import { z } from 'zod'

/** Email plus the six-digit code from the verification email. */
export const verificationSchema = z.object({
  email: z.email(messageKey('auth.validation.emailInvalid')),
  code: z.string().regex(/^\d{6}$/, messageKey('auth.verify.codeFormat')),
})

export type VerificationFormData = z.infer<typeof verificationSchema>
