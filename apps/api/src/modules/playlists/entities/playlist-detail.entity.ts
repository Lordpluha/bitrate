import { ApiProperty } from '@nestjs/swagger'
import { PlaylistEntity } from './playlist.entity'
import { PlaylistOwnerEntity } from './playlist-owner.entity'
import { PlaylistTrackEntity } from './playlist-track.entity'

/** A playlist populated with its tracks and owner summary. */
export class PlaylistDetailEntity extends PlaylistEntity {
  /** The playlist's tracks, in position order. */
  @ApiProperty({ type: [PlaylistTrackEntity] })
  tracks: PlaylistTrackEntity[]

  /** The playlist's owner. */
  @ApiProperty({ type: PlaylistOwnerEntity })
  user: PlaylistOwnerEntity
}
