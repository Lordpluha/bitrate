/** Format discriminator for CMAF rows in TrackFile. */
export const CMAF_FORMAT = 'cmaf'

/** MIME type every CMAF rendition is served with. */
export const CMAF_CONTENT_TYPE = 'audio/mp4'

/** Current manifest schema version. */
export const MANIFEST_VERSION = 1

/**
 * Structural shape of the playback manifest.
 *
 * Deliberately a plain type rather than the `TrackManifestEntity` class: the
 * Swagger CLI plugin inlines a `require()` of the *source* file for any class it
 * infers as a controller return type, which cannot resolve from `dist` at
 * runtime. The class still documents the response through `$ref` in
 * `GetTrackManifestSwagger`.
 */
export type TrackManifestPayload = {
  version: number
  timescale: number
  durationTicks: number
  durationMs: number
  renditions: {
    bitrate: number
    codec: string
    size: number
    initRange: [number, number]
    fragments: [number, number, number, number][]
  }[]
}

/** One rendition as it appears in the public manifest. */
export type ManifestRendition = TrackManifestPayload['renditions'][number]

/** Resolved byte window for a Range response. */
export type ResolvedRange = {
  start: number
  end: number
  contentLength: number
  isPartial: boolean
}

/** A rendition file plus the range the client asked for. */
export type RenditionStream = {
  stream: NodeJS.ReadableStream
  fileSize: number
  contentType: string
} & ResolvedRange

/** A CMAF `TrackFile` row as persisted, before validation. */
export type StoredRendition = {
  bitrate: number
  codec: string | null
  size: number | null
  initRangeStart: number | null
  initRangeEnd: number | null
  fragments: unknown
}

/** Carries the representation size required by an RFC 9110 416 response. */
export class UnsatisfiableRangeError extends Error {
  constructor(readonly fileSize: number) {
    super('Requested byte range is not satisfiable')
  }
}
