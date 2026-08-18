/**
 * Fragment entry as stored in the manifest: `[startTicks, durationTicks, offset, length]`.
 * Offsets are absolute byte positions inside the rendition file.
 */
export type ManifestFragment = readonly [
  startTicks: number,
  durationTicks: number,
  offset: number,
  length: number,
]

export type ManifestRendition = {
  bitrate: number
  codec: string
  size: number
  /** Inclusive byte range of the MSE initialization segment (`ftyp`+`moov`). */
  initRange: readonly [number, number]
  fragments: readonly ManifestFragment[]
}

export type TrackManifest = {
  version: number
  timescale: number
  durationTicks: number
  durationMs: number
  renditions: readonly ManifestRendition[]
}

/** A fragment resolved against a rendition, ready to be requested. */
export type ResolvedFragment = {
  index: number
  bitrate: number
  startSeconds: number
  endSeconds: number
  /** Inclusive byte range for the HTTP `Range` header. */
  byteRange: readonly [number, number]
}
