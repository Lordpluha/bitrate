import { ApiProperty } from '@nestjs/swagger'

/** One rendition of a track, addressable by byte range. */
export class TrackManifestRenditionEntity {
  /** Bitrate in kbps. */
  @ApiProperty({ example: 192 })
  bitrate: number

  /** RFC 6381 codec string for `MediaSource.isTypeSupported`. */
  @ApiProperty({ example: 'mp4a.40.2' })
  codec: string

  /** Total file size in bytes. */
  @ApiProperty({ example: 1_456_523 })
  size: number

  /**
   * Inclusive byte range of the MSE initialization segment (`ftyp`+`moov`).
   * The `sidx` index is parsed server-side and deliberately excluded.
   */
  @ApiProperty({ example: [0, 707], type: [Number] })
  initRange: [number, number]

  /**
   * One entry per fragment: `[startTicks, durationTicks, offset, length]`.
   * Offsets and lengths are absolute byte positions in the rendition file;
   * a Range request uses `bytes=offset-(offset+length-1)`.
   */
  @ApiProperty({
    type: 'array',
    items: { type: 'array', items: { type: 'number' } },
    example: [
      [0, 195_584, 929, 98_987],
      [195_584, 196_608, 99_916, 99_228],
    ],
  })
  fragments: number[][]
}

/**
 * Everything the player needs to start streaming a track without probing the
 * audio files. Immutable for a given track, so it can be cached indefinitely.
 */
export class TrackManifestEntity {
  /** Manifest schema version; bumped when fragment semantics change. */
  @ApiProperty({ example: 1 })
  version: number

  /** Ticks per second shared by every rendition. */
  @ApiProperty({ example: 48_000 })
  timescale: number

  /** Track duration in ticks. */
  @ApiProperty({ example: 2_880_000 })
  durationTicks: number

  /** Track duration in milliseconds, derived from `durationTicks`. */
  @ApiProperty({ example: 60_000 })
  durationMs: number

  /** Renditions ordered from the lowest bitrate to the highest. */
  @ApiProperty({ type: [TrackManifestRenditionEntity] })
  renditions: TrackManifestRenditionEntity[]
}
