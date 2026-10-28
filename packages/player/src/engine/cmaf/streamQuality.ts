import type { TrackManifest } from './manifest'

/**
 * The highest rendition (kbps) the listener's audio-quality setting allows; null means no cap.
 * Module state like the remembered throughput: the player widget mirrors the setting here so
 * every new loader picks it up.
 */
let maxStreamBitrate: number | null = null

export const setMaxStreamBitrate = (kbps: number | null) => {
  maxStreamBitrate = kbps
}

export const getMaxStreamBitrate = () => maxStreamBitrate

type CapBitrateInput = {
  bitrate: number
  manifest: TrackManifest
  maxBitrate: number | null
}

/** The best rendition at or under the cap; the lowest one when all are above it. */
export const capBitrate = ({ bitrate, manifest, maxBitrate }: CapBitrateInput) => {
  if (maxBitrate === null || bitrate <= maxBitrate) return bitrate
  const bitrates = manifest.renditions.map((rendition) => rendition.bitrate)
  const allowed = bitrates.filter((candidate) => candidate <= maxBitrate)
  return allowed.length > 0 ? Math.max(...allowed) : Math.min(...bitrates)
}
