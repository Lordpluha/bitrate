import type { Redis } from 'ioredis'
import { SUPPORT_CONTACT_MESSAGES_PER_MINUTE } from '../chat/support-limits'

/** `notify` is the first message over the limit: it gets one notice, the rest are dropped. */
type ContactRate = 'allow' | 'notify' | 'drop'

const WINDOW_SECONDS = 60

/** A fixed one-minute window per messenger contact (#567 abuse and cost limits). */
export async function checkContactRate(
  redis: Pick<Redis, 'incr' | 'expire'>,
  channel: string,
  contactId: string,
  now = Date.now(),
): Promise<ContactRate> {
  const window = Math.floor(now / (WINDOW_SECONDS * 1000))
  const key = `bitrate:support:contact:${channel}:${contactId}:${window}`
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, WINDOW_SECONDS)
  if (count <= SUPPORT_CONTACT_MESSAGES_PER_MINUTE) return 'allow'
  return count === SUPPORT_CONTACT_MESSAGES_PER_MINUTE + 1 ? 'notify' : 'drop'
}
