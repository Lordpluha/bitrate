import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** An album as seen by the operator surface. */
export class AdminAlbumEntity {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The title value. */
  @ApiProperty()
  title: string

  /** The stored cover image's filename (a storage key, not a URL), or `null`. */
  @ApiPropertyOptional({ nullable: true })
  cover: string | null

  /** The owning artist's id. */
  @ApiProperty()
  artistId: string

  /** The owning artist's display name — avoids an N+1 lookup on the operator screen. */
  @ApiProperty()
  artistUsername: string

  /** The album type value. */
  @ApiProperty({ enum: ['ALBUM', 'SINGLE', 'EP', 'COMPILATION'] })
  type: 'ALBUM' | 'SINGLE' | 'EP' | 'COMPILATION'

  /** How many tracks the album lists. */
  @ApiProperty()
  totalTracks: number

  /** Release date, or `null` if unset. */
  @ApiPropertyOptional({ nullable: true })
  releaseDate: Date | null

  /** Soft-delete (take-down) timestamp. */
  @ApiPropertyOptional({ nullable: true })
  deletedAt: Date | null

  /** The created at value. */
  @ApiProperty()
  createdAt: Date

  /** The updated at value. */
  @ApiProperty()
  updatedAt: Date
}
