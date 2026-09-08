import { ApiProperty } from '@nestjs/swagger'
import type { Staff, StaffRole } from '@prisma/client'

/** Represents a staff operator, excluding secret material. */
export class StaffEntity implements Omit<Staff, 'password' | 'twoFactorSecret'> {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The email value. */
  @ApiProperty()
  email: string

  /** The username value. */
  @ApiProperty()
  username: string

  /** The staff role value. */
  @ApiProperty({ enum: ['ADMIN', 'MODERATOR'] })
  role: StaffRole

  /** Whether two-factor authentication is enabled. */
  @ApiProperty()
  twoFactorEnabled: boolean

  /** Consecutive failed login attempts. */
  @ApiProperty()
  failedLoginAttempts: number

  /** Account lock expiration timestamp. */
  @ApiProperty({ nullable: true })
  lockedUntil: Date | null

  /** Soft-delete timestamp. */
  @ApiProperty({ nullable: true })
  deletedAt: Date | null

  /** The created at value. */
  @ApiProperty()
  createdAt: Date

  /** The updated at value. */
  @ApiProperty()
  updatedAt: Date
}
