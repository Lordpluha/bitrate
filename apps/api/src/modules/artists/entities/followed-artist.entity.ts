import { ApiProperty } from '@nestjs/swagger'
import { ArtistWithFollowersCountEntity } from './artist-with-followers-count.entity'

/** An artist as it appears in the current user's followed-artists list. */
export class FollowedArtistEntity extends ArtistWithFollowersCountEntity {
  /** When the current user started following this artist. */
  @ApiProperty()
  followedAt: Date
}
