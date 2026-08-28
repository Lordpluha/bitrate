/** Format discriminator for CMAF rows in TrackFile. */
export const CMAF_FORMAT = 'cmaf'

/** The single audio codec produced by the CMAF pipeline. */
export const CMAF_CODEC = 'mp4a.40.2'

/** Signals that another upload became authoritative while this job was running. */
export class StaleAudioJobError extends Error {}

/** Describes a single prepared bitrate variant before storage upload. */
export interface PreparedVariant {
  /** Bitrate in kbps. */
  bitrate: number
  /** Opus codec identifier. */
  codec: string | null
  /** Storage key for the progressive audio file. */
  audioKey: string
  /** Absolute local path to the converted Opus file. */
  temporaryAudioPath: string
  /** File size of the converted Opus file in bytes. */
  size: number
}

/** A CMAF rendition prepared for upload, with its byte-range index (ADR-0020). */
interface PreparedCmafRendition {
  bitrate: number
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
}
