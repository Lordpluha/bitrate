import type {
  PlaybackOrigin,
  PlaySample,
  TrackedPlay,
} from '@/entities/PlaybackEvent/model/playbackEvent.types'

type StartPlayInput = PlaybackOrigin & {
  trackId: string
  sample: PlaySample
  now: Date
  clientPlayId: string
}

/** A new play of `trackId`, with nothing heard yet. */
export const startPlay = ({
  trackId,
  sample,
  now,
  clientPlayId,
  ...origin
}: StartPlayInput): TrackedPlay => ({
  ...origin,
  clientPlayId,
  trackId,
  startedAt: now.toISOString(),
  listenedMs: 0,
  last: sample,
})
