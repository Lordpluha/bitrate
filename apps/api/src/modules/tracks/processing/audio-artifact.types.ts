import type { StoredContentKey } from '../encryption/content-key.types'

/** Format discriminator for CMAF rows in TrackFile. */
export const CMAF_FORMAT = 'cmaf'

/** The single audio codec produced by the CMAF pipeline. */
export const CMAF_CODEC = 'mp4a.40.2'

/** Signals that another upload became authoritative while this job was running. */
export class StaleAudioJobError extends Error {}

/** A CMAF rendition prepared for upload, with its byte-range index (ADR-0020). */
interface PreparedCmafRendition {
  bitrate: number
  /** CENC `cbcs` under the package's content key (ADR-0077); `false` for the clear copy. */
  encrypted: boolean
  audioKey: string
  temporaryPath: string
  size: number
  initRange: [number, number]
  /** [startTicks, durationTicks, offset, length] per fragment. */
  fragments: number[][]
}

/** Everything the manifest endpoint needs after a successful CMAF pass. */
export interface PreparedCmafPackage {
  timescale: number
  durationTicks: number
  renditions: PreparedCmafRendition[]
  /** The wrapped content key of the encrypted renditions; `null` when nothing is encrypted. */
  contentKey: StoredContentKey | null
}
