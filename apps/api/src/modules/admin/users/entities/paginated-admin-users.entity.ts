import { ApiProperty } from '@nestjs/swagger'
import { AdminUserEntity } from './admin-user.entity'

/** A page of operator-facing users. */
export class PaginatedAdminUsersEntity {
  /** The users on this page. */
  @ApiProperty({ type: [AdminUserEntity] })
  data: AdminUserEntity[]

  /** The total number of users matching the query. */
  @ApiProperty()
  total: number

  /** The current page number. */
  @ApiProperty()
  page: number

  /** The page size. */
  @ApiProperty()
  limit: number
}
