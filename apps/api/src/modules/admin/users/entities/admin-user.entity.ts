import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** A user as seen by the operator surface — never includes secrets. */
export class AdminUserEntity {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The username value. */
  @ApiProperty()
  username: string

  /** The email value. */
  @ApiProperty()
  email: string

  /** The avatar URL. */
  @ApiPropertyOptional({ nullable: true })
  avatar: string | null

  /** The profile description. */
  @ApiPropertyOptional({ nullable: true })
  description: string | null

  /** Whether two-factor authentication is enabled. */
  @ApiProperty()
  twoFactorEnabled: boolean

  /** Email verification timestamp. */
  @ApiPropertyOptional({ nullable: true })
  emailVerifiedAt: Date | null

  /** Consecutive failed login attempts. */
  @ApiProperty()
  failedLoginAttempts: number

  /** Account lock expiration timestamp. */
  @ApiPropertyOptional({ nullable: true })
  lockedUntil: Date | null

  /** Soft-delete timestamp. */
  @ApiPropertyOptional({ nullable: true })
  deletedAt: Date | null

  /** The created at value. */
  @ApiProperty()
  createdAt: Date

  /** The updated at value. */
  @ApiProperty()
  updatedAt: Date
}
