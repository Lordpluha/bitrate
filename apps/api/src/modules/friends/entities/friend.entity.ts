import { SafeUserEntity } from '@modules/users'
import { ApiProperty } from '@nestjs/swagger'

/** The artist credited on a friend's current track. */
export class FriendTrackArtistEntity {
  @ApiProperty()
  id: string

  @ApiProperty()
  username: string
}

/** The track a friend is playing right now. */
export class FriendTrackEntity {
  @ApiProperty()
  id: string

  @ApiProperty()
  title: string

  @ApiProperty({ type: String, nullable: true })
  cover: string | null

  @ApiProperty({ type: FriendTrackArtistEntity })
  artist: FriendTrackArtistEntity
}

/** Where a friend is, derived from their player activity. */
export class FriendPresenceEntity {
  @ApiProperty({ enum: ['online', 'away', 'offline'] })
  status: 'online' | 'away' | 'offline'

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  lastActiveAt: Date | null

  @ApiProperty({
    type: FriendTrackEntity,
    nullable: true,
    description: 'Only while a track plays and the friend shares their listening',
  })
  nowPlaying: FriendTrackEntity | null
}

/** One of the caller's friends. */
export class FriendEntity {
  @ApiProperty({ type: SafeUserEntity })
  user: SafeUserEntity

  @ApiProperty({ type: String, format: 'date-time' })
  friendsSince: Date

  @ApiProperty({ type: FriendPresenceEntity })
  presence: FriendPresenceEntity
}
