import { ApiProperty } from '@nestjs/swagger'
import type { User } from '@prisma/client'

/** Represents the safe user entity. */
export class SafeUserEntity implements Omit<User, 'password' | 'twoFactorSecret'> {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The username value. */
  @ApiProperty()
  username: string

  /** The email value. */
  @ApiProperty()
  email: string

  /** The created at value. */
  @ApiProperty()
  createdAt: Date

  /** The description value. */
  @ApiProperty()
  description: string | null

  /** The avatar value. */
  @ApiProperty()
  avatar: string | null

  /** The updated at value. */
  @ApiProperty()
  updatedAt: Date

  /** The two factor enabled value. */
  @ApiProperty()
  twoFactorEnabled: boolean

  /** Email verification timestamp. */
  @ApiProperty({ nullable: true })
  emailVerifiedAt: Date | null

  /** Consecutive failed login attempts. */
  @ApiProperty()
  failedLoginAttempts: number

  /** Account lock expiration timestamp. */
  @ApiProperty({ nullable: true })
  lockedUntil: Date | null

  /** Soft deletion timestamp. */
  @ApiProperty({ nullable: true })
  deletedAt: Date | null
}
