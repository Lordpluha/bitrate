import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** One of an artist's published albums, as seen from the artist detail page. */
export class AdminArtistAlbumEntity {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The title value. */
  @ApiProperty()
  title: string

  /** The stored cover image's filename, or `null`. */
  @ApiPropertyOptional({ nullable: true })
  cover: string | null

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
}
