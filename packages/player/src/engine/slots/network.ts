/**
 * When the standby slot starts loading the next track, and when a constrained connection holds
 * the first play back — moved from web-player with the thresholds its characterisation spec
 * pinned. Whether the connection is constrained comes from the host (`isConstrained`).
 */

const PREFETCH_AFTER_BUFFER_SECONDS = 8
const PREFETCH_REMAINING_SECONDS = 45
const CONSTRAINED_START_BUFFER_SECONDS = 3
const CONSTRAINED_PREFETCH_BUFFER_SECONDS = 8
const CONSTRAINED_PREFETCH_REMAINING_SECONDS = 30

/** The slice of `HTMLMediaElement` these checks read. */
export type MediaTiming = Pick<HTMLMediaElement, 'buffered' | 'currentTime' | 'duration' | 'paused'>

/** Seconds buffered ahead of the playhead in the range that contains it. */
export function bufferedAheadOf(media: MediaTiming): number {
  const { buffered, currentTime } = media

  for (let index = 0; index < buffered.length; index += 1) {
    if (buffered.start(index) <= currentTime && buffered.end(index) >= currentTime) {
      return buffered.end(index) - currentTime
    }
  }

  return 0
}

/**
 * True while a constrained connection has not buffered enough to start without an immediate
 * stall; playback then waits for `progress`/`canplay` instead of starting at once.
 */
export function shouldDelayInitialPlayback(media: MediaTiming, constrained: boolean): boolean {
  return (
    constrained &&
    media.currentTime < 1 &&
    bufferedAheadOf(media) < CONSTRAINED_START_BUFFER_SECONDS
  )
}

/**
 * True once the current track is close enough to its end, and safely enough buffered, to
 * spend bandwidth on the next one.
 */
export function shouldPrefetchNextTrack(media: MediaTiming, constrained: boolean): boolean {
  const bufferedAhead = bufferedAheadOf(media)
  const { duration } = media
  const remaining = duration - media.currentTime

  if (!Number.isFinite(duration)) return false

  if (!constrained) {
    return (
      remaining <= PREFETCH_REMAINING_SECONDS &&
      (bufferedAhead >= PREFETCH_AFTER_BUFFER_SECONDS || media.paused)
    )
  }

  return (
    remaining <= CONSTRAINED_PREFETCH_REMAINING_SECONDS &&
    bufferedAhead >= CONSTRAINED_PREFETCH_BUFFER_SECONDS
  )
}
