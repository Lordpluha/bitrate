import type { ApiSchemas } from '@bitrate/contracts'

export type Rendition = ApiSchemas['TrackManifestRenditionEntity']

/**
 * Chooses the rendition to stream: the best clear (unencrypted) one at or under `maxBitrate`,
 * else the lowest clear one. Encrypted renditions (ADR-0077 ClearKey) are skipped — the native
 * player has no EME path yet — so null means "nothing this device can play".
 */
export function pickRendition(renditions: Rendition[], maxBitrate: number): Rendition | null {
  const clear = renditions.filter((rendition) => !rendition.encryption).sort((a, b) => b.bitrate - a.bitrate)
  return clear.find((rendition) => rendition.bitrate <= maxBitrate) ?? clear.at(-1) ?? null
}
