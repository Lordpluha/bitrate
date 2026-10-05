import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { AdminPodcastEntity } from './admin-podcast.entity'
import { AdminPodcastEpisodeEntity } from './admin-podcast-episode.entity'

/** A podcast's full operator detail view — the list row plus its description and episodes. */
export class AdminPodcastDetailEntity extends AdminPodcastEntity {
  /** The podcast description, if any. */
  @ApiPropertyOptional({ nullable: true })
  description: string | null

  /** The podcast's episodes, newest release first, taken-down ones included. */
  @ApiProperty({ type: [AdminPodcastEpisodeEntity] })
  episodes: AdminPodcastEpisodeEntity[]
}
