import type {
  PlaySample,
  TrackedPlay,
} from '@/entities/PlaybackEvent/model/playbackEvent.types'

/**
 * The longest step between two ticks that still counts as heard audio. The element reports about
 * four times a second, so a larger forward jump is a seek, and seeking past audio is not hearing it.
 */
const MAX_HEARD_STEP_SECONDS = 1.5

const MS_PER_SECOND = 1000

type SamplePlayInput = {
  play: TrackedPlay
  sample: PlaySample
}

/** The play after one more tick: heard time grows only while it was and still is playing. */
export const samplePlay = ({ play, sample }: SamplePlayInput): TrackedPlay => {
  const step = sample.currentTime - play.last.currentTime
  const heard =
    play.last.isPlaying &&
    sample.isPlaying &&
    step > 0 &&
    step <= MAX_HEARD_STEP_SECONDS
      ? Math.round(step * MS_PER_SECOND)
      : 0
  return { ...play, listenedMs: play.listenedMs + heard, last: sample }
}
