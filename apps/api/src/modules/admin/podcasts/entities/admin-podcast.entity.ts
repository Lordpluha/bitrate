import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** A podcast as seen by the operator surface. */
export class AdminPodcastEntity {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The title value. */
  @ApiProperty()
  title: string

  /** The publisher's display name. */
  @ApiProperty()
  publisher: string

  /** The stored cover image reference, or `null`. */
  @ApiPropertyOptional({ nullable: true })
  cover: string | null

  /** The podcast's language code, if any. */
  @ApiPropertyOptional({ nullable: true })
  language: string | null

  /** Whether the podcast is flagged explicit. */
  @ApiProperty()
  explicit: boolean

  /** How many episodes the podcast has, taken-down ones included. */
  @ApiProperty()
  episodeCount: number

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
