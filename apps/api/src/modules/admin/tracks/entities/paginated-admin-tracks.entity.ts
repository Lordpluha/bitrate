import { ApiProperty } from '@nestjs/swagger'
import { AdminTrackEntity } from './admin-track.entity'

/** A page of operator-facing tracks. */
export class PaginatedAdminTracksEntity {
  /** The tracks on this page. */
  @ApiProperty({ type: [AdminTrackEntity] })
  data: AdminTrackEntity[]

  /** The total number of tracks matching the query. */
  @ApiProperty()
  total: number

  /** The current page number. */
  @ApiProperty()
  page: number

  /** The page size. */
  @ApiProperty()
  limit: number
}
