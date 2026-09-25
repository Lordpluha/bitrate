import { ApiProperty } from '@nestjs/swagger'
import { AdminArtistAlbumEntity } from './admin-artist-album.entity'

/** A page of an artist's published albums. */
export class PaginatedAdminArtistAlbumsEntity {
  /** The albums on this page. */
  @ApiProperty({ type: [AdminArtistAlbumEntity] })
  data: AdminArtistAlbumEntity[]

  /** The total number of albums matching the query. */
  @ApiProperty()
  total: number

  /** The current page number. */
  @ApiProperty()
  page: number

  /** The page size. */
  @ApiProperty()
  limit: number
}
