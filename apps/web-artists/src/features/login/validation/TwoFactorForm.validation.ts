import { messageKey } from '@shared/i18n'
import { z } from 'zod'

export const twoFactorFormSchema = z.object({
  code: z.string().regex(/^\d{6}$/, messageKey('auth.twoFactor.codeFormat')),
})

export type TwoFactorFormData = z.infer<typeof twoFactorFormSchema>
