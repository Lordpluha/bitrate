import { ApiProperty } from '@nestjs/swagger'
import { SafeArtistEntity } from './safe-artists.entity'

/** Follow/unfollow counters embedded alongside a safe artist projection. */
export class ArtistFollowersCountEntity {
  /** The artist's current follower count. */
  @ApiProperty()
  followers: number
}

/** A safe artist projection carrying its live follower count. */
export class ArtistWithFollowersCountEntity extends SafeArtistEntity {
  /** Aggregate counters for this artist. */
  @ApiProperty({ type: ArtistFollowersCountEntity })
  _count: ArtistFollowersCountEntity
}
