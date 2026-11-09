import { z } from 'zod'

/**
 * A sign-in address, trimmed and lower-cased before it is validated or looked up.
 * Autofill and mobile keyboards add capitals and stray spaces; without this a trailing space
 * reads as "Invalid email format" and "User@…" as "Invalid credentials". Every audience
 * (listeners, artists, staff) parses its email fields through this one schema.
 */
export const EmailSchema = z.string().trim().toLowerCase().pipe(z.email())
