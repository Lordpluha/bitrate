import type { BitratePlayerLabels } from '../../contract'
import { playPauseLabel } from './play-pause-label'
import { REPEAT_LABELS } from './repeat-labels'

/** The English labels the element renders unless the host supplies its own. */
export const DEFAULT_LABELS: BitratePlayerLabels = {
  play: (trackTitle) => playPauseLabel(trackTitle, false),
  pause: (trackTitle) => playPauseLabel(trackTitle, true),
  preparing: 'Preparing…',
  previous: 'Previous track',
  next: 'Next track',
  enableShuffle: 'Enable shuffle',
  disableShuffle: 'Disable shuffle',
  repeat: REPEAT_LABELS,
  like: 'Like',
  unlike: 'Unlike',
  mute: 'Mute',
  unmute: 'Unmute',
  volume: 'Volume',
  seek: 'Seek playback',
  openFloating: 'Open floating player',
  openQueue: 'Open queue',
  openFull: 'Open full player',
  quality: 'Quality',
}

/** The host's labels over the defaults; a partial `repeat` keeps the missing modes. */
export function resolveLabels(
  overrides: Partial<BitratePlayerLabels> | null | undefined,
): BitratePlayerLabels {
  if (!overrides) return DEFAULT_LABELS
  return {
    ...DEFAULT_LABELS,
    ...overrides,
    repeat: { ...DEFAULT_LABELS.repeat, ...overrides.repeat },
  }
}
