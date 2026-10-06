import { ApiProperty } from '@nestjs/swagger'
import { AdminPodcastEntity } from './admin-podcast.entity'

/** A page of operator-facing podcasts. */
export class PaginatedAdminPodcastsEntity {
  /** The podcasts on this page. */
  @ApiProperty({ type: [AdminPodcastEntity] })
  data: AdminPodcastEntity[]

  /** The total number of podcasts matching the query. */
  @ApiProperty()
  total: number

  /** The current page number. */
  @ApiProperty()
  page: number

  /** The page size. */
  @ApiProperty()
  limit: number
}
