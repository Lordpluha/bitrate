import { ApiProperty } from '@nestjs/swagger'

/** The result of revoking every active session for a user or artist account. */
export class AdminRevokeSessionsResultEntity {
  /** How many sessions were deleted. */
  @ApiProperty()
  revoked: number
}
