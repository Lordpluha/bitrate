import { ApiProperty } from '@nestjs/swagger'
import { AdminUserEntity } from './admin-user.entity'
import { AdminUserCountsEntity } from './admin-user-counts.entity'

/** A user's full operator detail view — the directory row plus activity counts. */
export class AdminUserDetailEntity extends AdminUserEntity {
  /** Activity counts for this user. */
  @ApiProperty({ type: AdminUserCountsEntity })
  counts: AdminUserCountsEntity
}
