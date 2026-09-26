import { ApiProperty } from '@nestjs/swagger'
import { AdminModerationReportEntity } from './moderation-report.entity'

/** A page of moderation reports. */
export class PaginatedReportsEntity {
  /** The reports on this page. */
  @ApiProperty({ type: [AdminModerationReportEntity] })
  data: AdminModerationReportEntity[]

  /** The total number of reports matching the query. */
  @ApiProperty()
  total: number

  /** The current page number. */
  @ApiProperty()
  page: number

  /** The page size. */
  @ApiProperty()
  limit: number
}
