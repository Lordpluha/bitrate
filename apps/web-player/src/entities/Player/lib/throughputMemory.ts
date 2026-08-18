import type { TrackManifest } from '@/entities/Player/model/manifest.types'

const STORAGE_KEY = 'player-throughput'

/**
 * A remembered estimate older than this is ignored. Network conditions change
 * between sessions — yesterday's fibre says nothing about today's train.
 */
const MAX_AGE_MS = 6 * 60 * 60 * 1000

/**
 * Share of the remembered bandwidth spent on the *first* fragment.
 *
 * Deliberately below the steady-state factor: a stall mid-track costs one
 * fragment, a stall before the first sound reads as "the player is broken".
 */
const START_SAFETY_FACTOR = 0.5

type StoredEstimate = {
  bps: number
  savedAtMs: number
}

/** Last measured bandwidth in bits per second, or null when unknown or stale. */
export const readRememberedThroughput = (): number | null => {
  if (typeof localStorage === 'undefined') return null

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed: StoredEstimate = JSON.parse(raw)
    if (typeof parsed.bps !== 'number' || typeof parsed.savedAtMs !== 'number')
      return null
    if (Date.now() - parsed.savedAtMs > MAX_AGE_MS) return null

    return parsed.bps > 0 ? parsed.bps : null
  } catch {
    return null
  }
}

type RememberThroughputInput = {
  bps: number
}

/** Persists the current estimate so the next track can start at the right rung. */
export const rememberThroughput = ({ bps }: RememberThroughputInput): void => {
  if (typeof localStorage === 'undefined' || bps <= 0) return

  try {
    const payload: StoredEstimate = { bps, savedAtMs: Date.now() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    return
  }
}

type PickStartBitrateInput = {
  manifest: TrackManifest
  throughputBps: number | null
}

/**
 * Chooses the rendition to open a track with.
 *
 * Without a remembered estimate the lowest rung is the only honest choice —
 * nothing is known about the connection yet. With one, starting at the bottom
 * and climbing wastes the first ~20 seconds of every track at a quality the
 * listener's connection outgrew long ago.
 */
export const pickStartBitrate = ({
  manifest,
  throughputBps,
}: PickStartBitrateInput): number | undefined => {
  const ladder = manifest.renditions.map((rendition) => rendition.bitrate)
  const lowest = ladder[0]
  if (lowest === undefined) return undefined
  if (throughputBps === null) return lowest

  const affordableBps = throughputBps * START_SAFETY_FACTOR

  return (
    [...ladder].reverse().find((bitrate) => bitrate * 1000 <= affordableBps) ??
    lowest
  )
}
