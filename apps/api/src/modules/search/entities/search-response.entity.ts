import { ApiProperty } from '@nestjs/swagger'
import { SearchResultEntity } from './search-result.entity'
import { SearchResultsByTypeEntity } from './search-results-by-type.entity'
import { SearchTotalsByTypeEntity } from './search-totals-by-type.entity'

/** Search results grouped and paginated independently per type. */
export class SearchResponseEntity {
  /** Results grouped by bucket. */
  @ApiProperty({ type: SearchResultsByTypeEntity })
  data: SearchResultsByTypeEntity

  /** Result count per bucket. */
  @ApiProperty({ type: SearchTotalsByTypeEntity })
  totals: SearchTotalsByTypeEntity

  /** Total results across every bucket. */
  @ApiProperty()
  total: number

  /** Current page, shared across every bucket. */
  @ApiProperty()
  page: number

  /** Page size, shared across every bucket. */
  @ApiProperty()
  limit: number

  /** Maximum results returned in each bucket. */
  @ApiProperty()
  limitPerType: number

  /** The single highest-ranked result across every bucket, when any results were found. */
  @ApiProperty({ type: SearchResultEntity, nullable: true })
  topResult: SearchResultEntity | null
}
