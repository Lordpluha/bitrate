import { messageKey } from '@shared/i18n'
import { z } from 'zod'

export const loginSchema = z.object({
  /**
   * Piped rather than chained: zod 4 deprecates `.email()` on a string, and a bare `z.email()`
   * would answer an empty field with "invalid email" instead of "required".
   */
  email: z
    .string()
    .min(1, messageKey('auth.validation.emailRequired'))
    .pipe(z.email(messageKey('auth.validation.emailInvalid'))),
  password: z.string().min(1, messageKey('auth.validation.passwordRequired')),
})

export type LoginFormData = z.infer<typeof loginSchema>
