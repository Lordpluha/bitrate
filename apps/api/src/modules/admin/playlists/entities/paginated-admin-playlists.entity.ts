import { ApiProperty } from '@nestjs/swagger'
import { AdminPlaylistEntity } from './admin-playlist.entity'

/** A page of operator-facing playlists. */
export class PaginatedAdminPlaylistsEntity {
  /** The playlists on this page. */
  @ApiProperty({ type: [AdminPlaylistEntity] })
  data: AdminPlaylistEntity[]

  /** The total number of playlists matching the query. */
  @ApiProperty()
  total: number

  /** The current page number. */
  @ApiProperty()
  page: number

  /** The page size. */
  @ApiProperty()
  limit: number
}
