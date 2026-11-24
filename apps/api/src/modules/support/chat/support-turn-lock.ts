import { randomUUID } from 'node:crypto'
import type { Redis } from 'ioredis'
import { SUPPORT_TURN_LOCK_SECONDS } from './support-limits'

/** Deletes the lock only if this holder still owns it, so a late release frees nobody else. */
const RELEASE_SCRIPT = `
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
end
return 0
`

/**
 * One turn at a time per conversation: a double-sent message must not run (and pay for) the
 * model twice. Returns a release function, or undefined when a turn is already running.
 */
export async function acquireTurnLock(
  redis: Pick<Redis, 'set' | 'eval'>,
  conversationId: string,
): Promise<(() => Promise<void>) | undefined> {
  const key = `bitrate:support:turn:${conversationId}`
  const owner = randomUUID()
  const acquired = await redis.set(key, owner, 'EX', SUPPORT_TURN_LOCK_SECONDS, 'NX')
  if (acquired !== 'OK') return undefined
  return async () => {
    await redis.eval(RELEASE_SCRIPT, 1, key, owner)
  }
}
