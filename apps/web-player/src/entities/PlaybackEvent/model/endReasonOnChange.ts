import type {
  PlaybackEndReason,
  TrackedPlay,
} from '@/entities/PlaybackEvent/model/playbackEvent.types'

/** A play whose position got this close to the end played to the end. */
const END_TOLERANCE_SECONDS = 2

type EndReasonOnChangeInput = {
  play: TrackedPlay
}

/**
 * How a play that another play replaces ended: it reached the end, or the listener moved on
 * before that.
 */
export const endReasonOnChange = ({
  play,
}: EndReasonOnChangeInput): PlaybackEndReason =>
  play.last.duration > 0 &&
  play.last.currentTime >= play.last.duration - END_TOLERANCE_SECONDS
    ? 'COMPLETED'
    : 'SKIPPED'
