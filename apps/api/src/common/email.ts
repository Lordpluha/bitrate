import { z } from 'zod'

/** Trims and lower-cases a string input; anything else is left for the email check to reject. */
const normalizeEmailInput = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value

/**
 * A sign-in address, trimmed and lower-cased before it is validated or looked up.
 * Autofill and mobile keyboards add capitals and stray spaces; without this a trailing space
 * reads as "Invalid email format" and "User@…" as "Invalid credentials". Every audience
 * (listeners, artists, staff) parses its email fields through this one schema.
 *
 * `preprocess` rather than `.pipe()`: the generated OpenAPI describes a schema's input side, and
 * only here is that side still `format: email`, so the published contracts keep the format.
 */
export const EmailSchema = z.preprocess(normalizeEmailInput, z.email())
