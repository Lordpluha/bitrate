import z from 'zod'

/** Messages are i18n catalog keys: the form shows them through `translateMessage`. */
export const passwordSchema = z
  .string()
  .min(8, 'validation.password.min')
  .refine((val) => /[a-z]/.test(val), {
    error: 'validation.password.lowercase',
  })
  .refine((val) => /[A-Z]/.test(val), {
    error: 'validation.password.uppercase',
  })
  .refine((val) => /\d/.test(val), {
    error: 'validation.password.number',
  })
  .refine((val) => /[@$!%*?&]/.test(val), {
    error: 'validation.password.special',
  })
