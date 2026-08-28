import type { UserEntity } from '@modules/users'
import { ApiProperty } from '@nestjs/swagger'
import type { UserSession } from '@prisma/client'

/** Represents the user session entity. */
export class UserSessionEntity implements UserSession {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The user id value. */
  @ApiProperty()
  userId: UserEntity['id']

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
