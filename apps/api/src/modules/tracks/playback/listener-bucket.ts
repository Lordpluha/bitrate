/**
 * Listener-wide pacing (ADR-0072): however many sessions and tracks a listener opens, together
 * they receive audio no faster than {@link LISTENER_CONCURRENT_STREAMS} real-time streams plus a
 * {@link LISTENER_BURST_MS} burst. It is a leaky bucket: each charge adds its audio, the level
 * drains at the stream rate, and a charge that would overflow the burst is refused.
 */

/** Real-time streams one listener may receive at once: two devices, or a track plus its prefetch. */
export const LISTENER_CONCURRENT_STREAMS = 2

/**
 * Audio a listener may hold ahead of that rate: one track's start (the per-track 60-second
 * allowance), the next track's prefetch, and a second device starting at the same moment.
 */
export const LISTENER_BURST_MS = 150_000

/** A drained bucket carries no information, so its key outlives the drain by a minute only. */
export const LISTENER_BUCKET_TTL_SECONDS =
  Math.ceil(LISTENER_BURST_MS / LISTENER_CONCURRENT_STREAMS / 1000) + 60

/** The stored state of a listener's bucket. */
export type ListenerBucket = { levelMs: number; updatedAtMs: number }

/** The outcome of {@link chargeListenerBucket}: `excessMs` is 0 when the charge fits. */
export type ListenerBucketCharge = { excessMs: number; bucket: ListenerBucket }

/**
 * Charges `audioMs` to a bucket at `nowMs`. A refused charge leaves the bucket as it was; a clock
 * that went backwards drains nothing. Mirrors {@link CHARGE_LISTENER_BUCKET_SCRIPT}.
 */
export function chargeListenerBucket(
  bucket: ListenerBucket | undefined,
  audioMs: number,
  nowMs: number,
): ListenerBucketCharge {
  const previous = bucket ?? { levelMs: 0, updatedAtMs: nowMs }
  const elapsedMs = Math.max(0, nowMs - previous.updatedAtMs)
  const drained = Math.max(0, previous.levelMs - elapsedMs * LISTENER_CONCURRENT_STREAMS)
  const next = drained + audioMs
  if (next > LISTENER_BURST_MS) return { excessMs: next - LISTENER_BURST_MS, bucket: previous }
  return { excessMs: 0, bucket: { levelMs: next, updatedAtMs: nowMs } }
}

/** Seconds until an overflow of `excessMs` has drained. */
export function listenerRetryAfterSeconds(excessMs: number): number {
  return Math.max(1, Math.ceil(excessMs / LISTENER_CONCURRENT_STREAMS / 1000))
}

/**
 * {@link chargeListenerBucket} as one atomic Redis step, so parallel requests cannot all read the
 * same level and overflow together. KEYS[1] = bucket hash; ARGV = now, audioMs, streams, burst,
 * TTL seconds. Returns the excess in milliseconds, 0 when the charge was stored.
 */
export const CHARGE_LISTENER_BUCKET_SCRIPT = `
local now = tonumber(ARGV[1])
local audio = tonumber(ARGV[2])
local streams = tonumber(ARGV[3])
local burst = tonumber(ARGV[4])
local state = redis.call('HMGET', KEYS[1], 'levelMs', 'updatedAtMs')
local level = tonumber(state[1]) or 0
local updated = tonumber(state[2]) or now
local elapsed = now - updated
if elapsed < 0 then elapsed = 0 end
level = level - elapsed * streams
if level < 0 then level = 0 end
local nextLevel = level + audio
if nextLevel > burst then return nextLevel - burst end
redis.call('HSET', KEYS[1], 'levelMs', nextLevel, 'updatedAtMs', now)
redis.call('EXPIRE', KEYS[1], tonumber(ARGV[5]))
return 0
`
