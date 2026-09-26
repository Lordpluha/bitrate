import { ApiProperty } from '@nestjs/swagger'
import { AdminArtistTrackEntity } from './admin-artist-track.entity'

/** A page of an artist's published tracks. */
export class PaginatedAdminArtistTracksEntity {
  /** The tracks on this page. */
  @ApiProperty({ type: [AdminArtistTrackEntity] })
  data: AdminArtistTrackEntity[]

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
