import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** One episode of a podcast, as seen from the operator surface. */
export class AdminPodcastEpisodeEntity {
  /** The episode's id. */
  @ApiProperty()
  id: string

  /** The owning podcast's id. */
  @ApiProperty()
  podcastId: string

  /** The episode's title. */
  @ApiProperty()
  title: string

  /** The episode length in seconds, if known. */
  @ApiPropertyOptional({ nullable: true })
  duration: number | null

  /** Release date, or `null` if unset. */
  @ApiPropertyOptional({ nullable: true })
  releaseDate: Date | null

  /** Whether the episode is flagged explicit. */
  @ApiProperty()
  explicit: boolean

  /** The episode's own soft-delete timestamp — independent of the podcast's. */
  @ApiPropertyOptional({ nullable: true })
  deletedAt: Date | null
}
