import { ApiProperty } from '@nestjs/swagger'
import type { StaffSession } from '@prisma/client'
import type { StaffEntity } from './staff.entity'

/** Represents the staff session entity. */
export class StaffSessionEntity implements StaffSession {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The staff id value. */
  @ApiProperty()
  staffId: StaffEntity['id']

  /** The access token value. */
  @ApiProperty()
  access_token: string

  /** The refresh token value. */
  @ApiProperty()
  refresh_token: string

  /** The created at value. */
  @ApiProperty()
  createdAt: Date

  /** The expires at value. */
  @ApiProperty()
  expiresAt: Date
}
