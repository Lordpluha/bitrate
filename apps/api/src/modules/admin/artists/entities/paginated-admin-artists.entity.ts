import { ApiProperty } from '@nestjs/swagger'
import { AdminArtistEntity } from './admin-artist.entity'

/** A page of operator-facing artists. */
export class PaginatedAdminArtistsEntity {
  /** The artists on this page. */
  @ApiProperty({ type: [AdminArtistEntity] })
  data: AdminArtistEntity[]

  /** The total number of artists matching the query. */
  @ApiProperty()
  total: number

  /** The current page number. */
  @ApiProperty()
  page: number

  /** The page size. */
  @ApiProperty()
  limit: number
}
