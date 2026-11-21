import {
  chargeListenerBucket,
  type ListenerBucket,
  listenerRetryAfterSeconds,
} from './listener-bucket'
import { PACING_ALLOWANCE_MS, PlaybackPacingError } from './playback-pacing'

/** Entries kept per map; the least recently charged one is dropped beyond it. */
const MAX_ENTRIES = 10_000

/** A per-track budget not charged for this long starts over. */
const IDLE_RESET_MS = 60 * 60 * 1000

type TrackBudget = { openedAtMs: number; servedMs: number; lastChargedAtMs: number }

/** Who is charged: the listener and the track of a verified token. */
export type LocalPacingSubject = { userId: string; trackId: string }

/** Re-inserts `key` as the most recent entry and drops the oldest past {@link MAX_ENTRIES}. */
function remember<V>(map: Map<string, V>, key: string, value: V): void {
  map.delete(key)
  map.set(key, value)
  if (map.size > MAX_ENTRIES) {
    const oldest = map.keys().next().value
    if (oldest !== undefined) map.delete(oldest)
  }
}

/**
 * The pacing rules of ADR-0067 (per track) and ADR-0072 (per listener) kept in this process's
 * memory, used while Redis is unreachable (ADR-0072 D4). Each API replica paces on its own, so a
 * listener spread over N replicas gets at most N times the budget — bounded, unlike before.
 */
export class LocalPlaybackPacer {
  private readonly tracks = new Map<string, TrackBudget>()
  private readonly listeners = new Map<string, ListenerBucket>()

  /** @throws PlaybackPacingError when either budget would be exceeded; nothing is charged then. */
  charge({ userId, trackId }: LocalPacingSubject, audioMs: number, nowMs = Date.now()): void {
    const trackKey = `${userId}:${trackId}`
    const stored = this.tracks.get(trackKey)
    const track =
      stored && nowMs - stored.lastChargedAtMs < IDLE_RESET_MS
        ? stored
        : { openedAtMs: nowMs, servedMs: 0, lastChargedAtMs: nowMs }

    const served = track.servedMs + audioMs
    const allowanceMs = nowMs - track.openedAtMs + PACING_ALLOWANCE_MS
    if (served > allowanceMs) {
      throw new PlaybackPacingError(Math.ceil((served - allowanceMs) / 1000))
    }

    const { excessMs, bucket } = chargeListenerBucket(this.listeners.get(userId), audioMs, nowMs)
    if (excessMs > 0) throw new PlaybackPacingError(listenerRetryAfterSeconds(excessMs))

    remember(this.listeners, userId, bucket)
    remember(this.tracks, trackKey, { ...track, servedMs: served, lastChargedAtMs: nowMs })
  }
}
