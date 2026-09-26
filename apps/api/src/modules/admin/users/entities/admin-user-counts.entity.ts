import { ApiProperty } from '@nestjs/swagger'

/** Activity counts shown on the listener detail page. */
export class AdminUserCountsEntity {
  /** How many playlists the user owns. */
  @ApiProperty()
  playlists: number

  /** How many tracks the user has liked. */
  @ApiProperty()
  likedTracks: number

  /** How many listening-history rows the user has. */
  @ApiProperty()
  listeningHistory: number

  /** How many moderation reports the user has filed. */
  @ApiProperty()
  reportsFiled: number

  /** How many of the user's sessions have not yet expired. */
  @ApiProperty()
  activeSessions: number
}
