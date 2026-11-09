import z from 'zod'

/** Messages are i18n catalog keys: the form shows them through `translateMessage`. */
export const fullNameSchema = z
  .string()
  .min(2, 'validation.name.tooShort')
  .max(30, 'validation.name.tooLong')
  .regex(/^[a-zA-Z\s]+$/, 'validation.name.letters')
