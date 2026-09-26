import type { BitratePlayerRepeatMode } from '../../contract'

/** The label the repeat control shows for its *next* state, keyed by the current mode. */
export const REPEAT_LABELS: Record<BitratePlayerRepeatMode, string> = {
  all: 'Repeat one track',
  off: 'Repeat playlist',
  one: 'Disable repeat',
}
