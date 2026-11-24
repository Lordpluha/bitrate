import type { ApiSchemas } from '@bitrate/contracts'

/** `POST /me/playback-events`: one finished play. */
export type PlaybackEventBody = ApiSchemas['RecordPlaybackEventDto']

type PlaybackSource = PlaybackEventBody['source']
export type PlaybackEndReason = PlaybackEventBody['endReason']

/** Where the play came from, as the API stores it. */
export type PlaybackOrigin = {
  source: PlaybackSource
  sourceId?: string
}

/** One player tick: what the element reported in its last `statechange`. */
export type PlaySample = {
  /** Seconds. */
  currentTime: number
  /** Seconds; 0 until the element knows it. */
  duration: number
  isPlaying: boolean
}

/** A play in progress, kept by the player until it ends. */
export type TrackedPlay = PlaybackOrigin & {
  clientPlayId: string
  trackId: string
  /** ISO time the play started. */
  startedAt: string
  /** Audio actually heard so far. */
  listenedMs: number
  /** The last sample seen, to measure the next one against. */
  last: PlaySample
}
