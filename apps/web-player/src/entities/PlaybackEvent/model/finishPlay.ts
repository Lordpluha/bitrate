import type {
  PlaybackEndReason,
  PlaybackEventBody,
  TrackedPlay,
} from '@/entities/PlaybackEvent/model/playbackEvent.types'

/** Plays heard for less than this are noise (a skip through a queue) and are not reported. */
export const MIN_REPORTED_MS = 1000

type FinishPlayInput = {
  play: TrackedPlay
  endReason: PlaybackEndReason
  now: Date
}

/** The report for a finished play, or null when too little of it was heard to say anything. */
export const finishPlay = ({
  play,
  endReason,
  now,
}: FinishPlayInput): PlaybackEventBody | null => {
  if (play.listenedMs < MIN_REPORTED_MS) return null
  return {
    clientPlayId: play.clientPlayId,
    trackId: play.trackId,
    startedAt: play.startedAt,
    endedAt: now.toISOString(),
    listenedMs: play.listenedMs,
    endReason,
    source: play.source,
    ...(play.sourceId ? { sourceId: play.sourceId } : {}),
  }
}
