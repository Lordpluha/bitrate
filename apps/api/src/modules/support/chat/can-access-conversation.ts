import { timingSafeEqual } from 'node:crypto'
import { hashGuestToken } from './guest-token'

/** Who is asking: a signed-in listener, a guest with a token, or both. */
export interface SupportAccess {
  userId?: string
  token?: string
}

/**
 * A listener's conversation is theirs alone; a guest conversation opens with its token. The
 * hashes are compared in constant time.
 */
export function canAccessConversation(
  conversation: { userId: string | null; guestTokenHash: string | null },
  access: SupportAccess,
): boolean {
  if (conversation.userId !== null) return conversation.userId === access.userId
  if (conversation.guestTokenHash === null || !access.token) return false
  const expected = Buffer.from(conversation.guestTokenHash, 'hex')
  const actual = Buffer.from(hashGuestToken(access.token), 'hex')
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}
