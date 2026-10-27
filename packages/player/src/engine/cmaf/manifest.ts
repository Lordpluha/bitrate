/**
 * The manifest shape is wire data shared with hosts, so it lives in the contract; the engine
 * adds only the loader-internal `ResolvedFragment`.
 */
export type { ManifestRendition, TrackManifest } from '../../contract'

/** A fragment resolved against a rendition, ready to be requested. */
export type ResolvedFragment = {
  index: number
  bitrate: number
  startSeconds: number
  endSeconds: number
  /** Inclusive byte range for the HTTP `Range` header. */
  byteRange: readonly [number, number]
}
