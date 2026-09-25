import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** One stored rendition of a track's audio, as seen by the operator surface. */
export class AdminTrackFileEntity {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The container/encoding format — e.g. `opus`, `mp3`, `cmaf`. */
  @ApiProperty()
  format: string

  /** The bitrate in kbps. */
  @ApiProperty()
  bitrate: number

  /** The audio codec, if recorded. */
  @ApiPropertyOptional({ nullable: true })
  codec: string | null

  /** The file size in bytes, if recorded. */
  @ApiPropertyOptional({ nullable: true })
  size: number | null
}
