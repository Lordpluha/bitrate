import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** A public playlist as seen by the operator surface. */
export class AdminPlaylistEntity {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The title value. */
  @ApiProperty()
  title: string

  /** The stored cover image's filename (a storage key, not a URL), or `null`. */
  @ApiPropertyOptional({ nullable: true })
  cover: string | null

  /** The owning user's id. */
  @ApiProperty()
  ownerId: string

  /** The owning user's username — avoids an N+1 lookup on the operator screen. */
  @ApiProperty()
  ownerUsername: string

  /** Whether the playlist is public. An operator hide forces this to `false`. */
  @ApiProperty()
  isPublic: boolean

  /** How many users follow the playlist. */
  @ApiProperty()
  followersCount: number

  /** How many tracks the playlist holds. */
  @ApiProperty()
  trackCount: number

  /** Soft-delete (take-down) timestamp, independent of `isPublic`. */
  @ApiPropertyOptional({ nullable: true })
  deletedAt: Date | null

  /** The created at value. */
  @ApiProperty()
  createdAt: Date

  /** The updated at value. */
  @ApiProperty()
  updatedAt: Date
}
