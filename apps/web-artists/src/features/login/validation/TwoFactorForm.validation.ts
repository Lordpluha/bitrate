import { z } from 'zod'

export const twoFactorFormSchema = z.object({
  code: z
    .string()
    .regex(/^\d{6}$/, 'Enter the 6-digit code from your authenticator'),
})

export type TwoFactorFormData = z.infer<typeof twoFactorFormSchema>
