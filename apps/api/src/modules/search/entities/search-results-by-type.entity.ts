import { ApiProperty } from '@nestjs/swagger'
import { SearchResultEntity } from './search-result.entity'

/** Search results grouped by bucket. */
export class SearchResultsByTypeEntity {
  /** Matching tracks. */
  @ApiProperty({ type: [SearchResultEntity] })
  tracks: SearchResultEntity[]

  /** Matching artists. */
  @ApiProperty({ type: [SearchResultEntity] })
  artists: SearchResultEntity[]

  /** Matching albums. */
  @ApiProperty({ type: [SearchResultEntity] })
  albums: SearchResultEntity[]

  /** Matching playlists. */
  @ApiProperty({ type: [SearchResultEntity] })
  playlists: SearchResultEntity[]
}
