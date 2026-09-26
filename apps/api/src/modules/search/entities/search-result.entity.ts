import { ApiProperty } from '@nestjs/swagger'

/** One row of the unified search result set, whatever bucket it came from. */
export class SearchResultEntity {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The title value. */
  @ApiProperty()
  title: string

  /** The subtitle value. */
  @ApiProperty({ nullable: true })
  subtitle: string | null

  /** The image value. */
  @ApiProperty({ nullable: true })
  image: string | null

  /** Which bucket this result came from. */
  @ApiProperty({ enum: ['tracks', 'artists', 'albums', 'playlists'] })
  type: 'tracks' | 'artists' | 'albums' | 'playlists'

  /** Full-text search relevance rank. */
  @ApiProperty()
  rank: number

  /** The owning artist's id, when the result is artist-scoped. */
  @ApiProperty({ nullable: true })
  artistId: string | null

  /** The owning user's id, when the result is user-scoped. */
  @ApiProperty({ nullable: true })
  ownerId: string | null
}
