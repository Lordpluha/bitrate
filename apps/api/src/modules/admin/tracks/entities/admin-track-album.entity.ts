import { ApiProperty } from '@nestjs/swagger'

/** An album a track appears on, as seen by the operator surface. */
export class AdminTrackAlbumEntity {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The title value. */
  @ApiProperty()
  title: string

  /** The track's number within its disc on this album. */
  @ApiProperty()
  trackNumber: number

  /** The disc number within this album. */
  @ApiProperty()
  discNumber: number
}
