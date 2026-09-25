import { ApiProperty } from '@nestjs/swagger'

/** Result count per bucket. */
export class SearchTotalsByTypeEntity {
  /** Matching track count. */
  @ApiProperty()
  tracks: number

  /** Matching artist count. */
  @ApiProperty()
  artists: number

  /** Matching album count. */
  @ApiProperty()
  albums: number

  /** Matching playlist count. */
  @ApiProperty()
  playlists: number
}
