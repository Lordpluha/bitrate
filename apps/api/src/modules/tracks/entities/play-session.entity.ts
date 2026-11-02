import { ApiProperty } from '@nestjs/swagger'
import { TrackManifestEntity } from './track-manifest.entity'

/** A playback session: the manifest to play from and the token every rendition request carries. */
export class PlaySessionEntity {
  /** The track's byte-range playback manifest. */
  @ApiProperty({ type: TrackManifestEntity })
  manifest: TrackManifestEntity

  /** Signed token for `GET /tracks/:id/cmaf/:bitrate?t=…`. */
  @ApiProperty({ example: 'eyJzaWQiOiIuLi4ifQ.c2lnbmF0dXJl' })
  token: string

  /** When the token stops working, in Unix seconds. */
  @ApiProperty({ example: 1_793_300_000 })
  expiresAt: number
}
