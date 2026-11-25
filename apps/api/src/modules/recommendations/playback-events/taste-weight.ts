import type { PlaybackSource } from '@prisma/client'

/**
 * How much a play the system chose (radio, autoplay, mood, a generated mix) says about taste,
 * relative to one the listener chose. Below 1 so recommendations do not keep confirming
 * themselves through their own plays.
 */
export const SYSTEM_CHOSEN_WEIGHT = 0.5

/** How much a Jam track someone else queued says about the listener's own taste. */
export const OTHERS_JAM_PICK_WEIGHT = 0.5

const SYSTEM_CHOSEN_SOURCES: ReadonlySet<PlaybackSource> = new Set<PlaybackSource>([
  'RADIO',
  'AUTOPLAY',
  'MOOD',
  'GENERATED_PLAYLIST',
])

/** What the weight of one play depends on. */
export type TasteWeightInput = {
  source: PlaybackSource
  /** False when another Jam participant queued the track. */
  queuedByListener: boolean
}

/**
 * The weight a play carries in the listener's taste profile, fixed when the play is stored.
 * "Don't use for my taste" is not part of it: exclusions apply when signals are read, so they
 * also cover past plays and can be undone.
 */
export const tasteWeight = ({ source, queuedByListener }: TasteWeightInput): number => {
  if (SYSTEM_CHOSEN_SOURCES.has(source)) return SYSTEM_CHOSEN_WEIGHT
  if (source === 'JAM' && !queuedByListener) return OTHERS_JAM_PICK_WEIGHT
  return 1
}
