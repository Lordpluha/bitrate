import z from 'zod'

/**
 * Trimmed and lower-cased before the format check: autofill and mobile keyboards add a stray
 * space or a capital, which would otherwise read as "Invalid email address" or, once sent,
 * miss the stored lower-case account. The message is an i18n catalog key.
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('validation.email.invalid'))
