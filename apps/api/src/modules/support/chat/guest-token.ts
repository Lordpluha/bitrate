import { createHash, randomBytes } from 'node:crypto'

/** Header a guest sends its conversation token in; redacted from request logs. */
export const SUPPORT_TOKEN_HEADER = 'x-support-token'

/** 256 random bits, URL-safe. Shown to the guest once; only its hash is stored. */
export function createGuestToken(): string {
  return randomBytes(32).toString('base64url')
}

/** sha256 hex, the form stored in `SupportConversation.guestTokenHash`. */
export function hashGuestToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
