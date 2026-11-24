import type { TrackManifest } from './manifest'

/**
 * The renditions this element can play (ADR-0077): with ClearKey `cbcs` available, the encrypted
 * ladder of an encrypted track; otherwise only the clear renditions. Clear and encrypted are not
 * mixed, so ABR never switches between a decrypted and a plain source.
 *
 * @returns the manifest narrowed to playable renditions, or `null` when none is left.
 */
export function selectPlayableRenditions(
  manifest: TrackManifest,
  canDecrypt: boolean,
): TrackManifest | null {
  const encrypted = manifest.renditions.filter((rendition) => rendition.encryption)
  const clear = manifest.renditions.filter((rendition) => !rendition.encryption)
  const renditions = canDecrypt && encrypted.length > 0 ? encrypted : clear
  return renditions.length > 0 ? { ...manifest, renditions } : null
}
