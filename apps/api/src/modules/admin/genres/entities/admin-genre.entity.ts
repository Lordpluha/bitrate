import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** How many tracks, albums and artists reference a genre. */
export class AdminGenreCountsEntity {
  /** Tracks tagged with the genre. */
  @ApiProperty()
  tracks: number

  /** Albums tagged with the genre. */
  @ApiProperty()
  albums: number

  /** Artists tagged with the genre. */
  @ApiProperty()
  artists: number
}

/** A genre as seen by the operator surface, with its reference counts. */
export class AdminGenreEntity {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The URL slug, unique across genres. */
  @ApiProperty()
  slug: string

  /** The display name, unique across genres. */
  @ApiProperty()
  name: string

  /** The description. */
  @ApiPropertyOptional({ nullable: true })
  description: string | null

  /** The `#rrggbb` colour. */
  @ApiPropertyOptional({ nullable: true })
  color: string | null

  /** The cover image URL. */
  @ApiPropertyOptional({ nullable: true })
  cover: string | null

  /** What references this genre; delete is refused while any is above zero. */
  @ApiProperty({ type: AdminGenreCountsEntity })
  counts: AdminGenreCountsEntity

  /** The created at value. */
  @ApiProperty()
  createdAt: Date

  /** The updated at value. */
  @ApiProperty()
  updatedAt: Date
}
