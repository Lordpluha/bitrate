import { ApiRequestError } from '@/lib/api/api-request-error'

/** Seconds of playback after which a track counts as listened (same as the web player). */
const LISTEN_THRESHOLD_SEC = 15
/** Pause after a failed attempt; progress ticks twice a second and must not retry each time. */
const RETRY_DELAY_MS = 30_000
/** Attempts per track before the play is left unrecorded. */
const MAX_ATTEMPTS = 3

type ListenRecorderDeps = {
  record: (trackId: string) => Promise<void>
  now?: () => number
}

type ProgressInput = { trackId: string; positionSec: number }

/** A 4xx other than a timeout or a rate limit will fail the same way again. */
const isPermanent = (error: unknown) =>
  error instanceof ApiRequestError && error.status >= 400 && error.status < 500 && ![408, 429].includes(error.status)

/**
 * Records each track in the listening history once it has played long enough — at most once per
 * track, retrying transient failures a few times after a pause. Without it Recently played, the
 * Resume tile and the Library history never fill.
 */
export function createListenRecorder({ record, now = Date.now }: ListenRecorderDeps) {
  const settled = new Set<string>()
  const pending = new Set<string>()
  const attempts = new Map<string, { count: number; nextAt: number }>()

  return {
    onProgress({ trackId, positionSec }: ProgressInput): void {
      if (positionSec < LISTEN_THRESHOLD_SEC || settled.has(trackId) || pending.has(trackId)) return
      const previous = attempts.get(trackId)
      if (previous && now() < previous.nextAt) return

      pending.add(trackId)
      record(trackId)
        .then(() => {
          settled.add(trackId)
          attempts.delete(trackId)
        })
        .catch((error: unknown) => {
          const count = (previous?.count ?? 0) + 1
          if (isPermanent(error) || count >= MAX_ATTEMPTS) {
            settled.add(trackId)
            attempts.delete(trackId)
            return
          }
          attempts.set(trackId, { count, nextAt: now() + RETRY_DELAY_MS })
        })
        .finally(() => pending.delete(trackId))
    },
  }
}
