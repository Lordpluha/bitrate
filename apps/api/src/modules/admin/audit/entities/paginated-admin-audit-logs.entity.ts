import { ApiProperty } from '@nestjs/swagger'
import { AdminAuditLogEntity } from './admin-audit-log.entity'

/** A page of operator-facing audit log rows. */
export class PaginatedAdminAuditLogsEntity {
  /** The audit log rows on this page. */
  @ApiProperty({ type: [AdminAuditLogEntity] })
  data: AdminAuditLogEntity[]

  /** The total number of rows matching the query. */
  @ApiProperty()
  total: number

  /** The current page number. */
  @ApiProperty()
  page: number

  /** The page size. */
  @ApiProperty()
  limit: number
}
