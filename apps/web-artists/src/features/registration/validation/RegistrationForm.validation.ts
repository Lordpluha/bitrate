import { messageKey } from '@shared/i18n'
import { z } from 'zod'

/**
 * Piped rather than chained: zod 4 deprecates `.email()` on a string, and a bare `z.email()`
 * would answer an empty field with "invalid email" instead of "required".
 */
export const emailSchema = z
  .string()
  .min(1, messageKey('auth.validation.emailRequired'))
  .pipe(z.email(messageKey('auth.validation.emailInvalid')))

export const passwordSchema = z
  .string()
  .min(10, messageKey('auth.validation.passwordTooShort'))
  .regex(/[A-Za-z]/, messageKey('auth.validation.passwordLetter'))
  .regex(
    /[0-9]|[^A-Za-z0-9]/,
    messageKey('auth.validation.passwordNumberOrSymbol'),
  )

export const registrationSchema = z
  .object({
    email: emailSchema,
    password: z.string(),
    acceptLegal: z.boolean(),
    acceptArtistAgreement: z.boolean(),
  })
  .refine((data) => !data.password || data.password.length >= 10, {
    message: messageKey('auth.validation.passwordTooShort'),
    path: ['password'],
  })
  .refine((data) => !data.password || /[A-Za-z]/.test(data.password), {
    message: messageKey('auth.validation.passwordLetter'),
    path: ['password'],
  })
  .refine(
    (data) => !data.password || /[0-9]|[^A-Za-z0-9]/.test(data.password),
    {
      message: messageKey('auth.validation.passwordNumberOrSymbol'),
      path: ['password'],
    },
  )
  .refine((data) => !data.password || data.acceptLegal, {
    message: messageKey('auth.validation.acceptLegal'),
    path: ['acceptLegal'],
  })
  .refine((data) => !data.password || data.acceptArtistAgreement, {
    message: messageKey('auth.validation.acceptArtistAgreement'),
    path: ['acceptArtistAgreement'],
  })

export type RegistrationFormData = z.infer<typeof registrationSchema>
