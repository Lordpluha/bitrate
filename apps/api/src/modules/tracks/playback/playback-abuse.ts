/**
 * Suspicious-activity signals on opening play sessions (#522 D5): how many different tracks one
 * listener starts within a sliding window. Listening, skipping and prefetching stay far below the
 * thresholds; walking a catalogue to rip it does not.
 */

/** The sliding window the distinct tracks are counted in. */
export const ABUSE_WINDOW_MS = 10 * 60_000

/** Above this many distinct tracks in the window the listener is reported, not blocked. */
export const SUSPICIOUS_DISTINCT_TRACKS = 40

/** At this many distinct tracks in the window a new track is refused until the oldest expires. */
export const BLOCKED_DISTINCT_TRACKS = 120

/** Sorted set of the listener's recent track ids, scored by when each was last opened. */
export const recentTracksKey = (userId: string) => `playback:recent:${userId}`

/** The listener started too many different tracks; a new one may open after this many seconds. */
export class PlaybackAbuseError extends Error {
  constructor(readonly retryAfterSeconds: number) {
    super('Too many different tracks started in a short time')
  }
}
