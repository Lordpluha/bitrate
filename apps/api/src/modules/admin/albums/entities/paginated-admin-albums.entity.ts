import { ApiProperty } from '@nestjs/swagger'
import { AdminAlbumEntity } from './admin-album.entity'

/** A page of operator-facing albums. */
export class PaginatedAdminAlbumsEntity {
  /** The albums on this page. */
  @ApiProperty({ type: [AdminAlbumEntity] })
  data: AdminAlbumEntity[]

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
