import { ApiProperty } from '@nestjs/swagger'
import { AdminGenreEntity } from './admin-genre.entity'

/** A page of operator-facing genres. */
export class PaginatedAdminGenresEntity {
  /** The genres on this page. */
  @ApiProperty({ type: [AdminGenreEntity] })
  data: AdminGenreEntity[]

  /** The total number of genres matching the query. */
  @ApiProperty()
  total: number

  /** The current page number. */
  @ApiProperty()
  page: number

  /** The page size. */
  @ApiProperty()
  limit: number
}
