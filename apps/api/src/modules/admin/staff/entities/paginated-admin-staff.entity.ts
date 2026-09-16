import { ApiProperty } from '@nestjs/swagger'
import { AdminStaffEntity } from './admin-staff.entity'

/** A page of operator-facing staff. */
export class PaginatedAdminStaffEntity {
  /** The operators on this page. */
  @ApiProperty({ type: [AdminStaffEntity] })
  data: AdminStaffEntity[]

  /** The total number of operators matching the query. */
  @ApiProperty()
  total: number

  /** The current page number. */
  @ApiProperty()
  page: number

  /** The page size. */
  @ApiProperty()
  limit: number
}
