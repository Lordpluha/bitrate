import { TrackEntity } from '@modules/tracks/entities'
import { ApiProperty } from '@nestjs/swagger'

/** A track as it appears inside a populated playlist, carrying its playlist membership. */
export class PlaylistTrackEntity extends TrackEntity {
  /** The id of the row joining this track to the playlist. */
  @ApiProperty()
  playlistTrackId: string

  /** The track's 1-based position within the playlist. */
  @ApiProperty()
  position: number

  /** When the track was added to the playlist. */
  @ApiProperty()
  addedAt: Date

  /** The id of the user who added the track, when known. */
  @ApiProperty({ nullable: true })
  addedById: string | null
}
