import { z } from 'zod'
import { ARTIST_AGREEMENT_VERSION } from './legal'

/** Message returned when an upload arrives without the rights confirmation. */
export const RIGHTS_CONFIRMATION_MESSAGE =
  'You must confirm that you hold the rights to this content'

/**
 * The artist's confirmation that they hold the rights to what they upload. Multipart forms send
 * every field as text, so `'true'` is accepted next to the JSON boolean; anything else is refused.
 */
export const RightsConfirmedSchema = z
  .union([z.literal(true), z.literal('true')], { message: RIGHTS_CONFIRMATION_MESSAGE })
  .transform(() => true as const)

/** The columns that record a rights confirmation under the current Artist Agreement. */
export function rightsConfirmationRecord(now: Date = new Date()) {
  return { rightsConfirmedVersion: ARTIST_AGREEMENT_VERSION, rightsConfirmedAt: now }
}
