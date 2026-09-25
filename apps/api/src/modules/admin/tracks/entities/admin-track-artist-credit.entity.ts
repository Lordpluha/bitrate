import { ApiProperty } from '@nestjs/swagger'

/** One artist credited on a track, as seen by the operator surface. */
export class AdminTrackArtistCreditEntity {
  /** The credited artist's id. */
  @ApiProperty()
  artistId: string

  /** The credited artist's display name. */
  @ApiProperty()
  username: string

  /** Whether this credit is the track's primary artist. */
  @ApiProperty()
  isPrimary: boolean

  /** The credit's display position among the track's artists. */
  @ApiProperty()
  position: number
}
