import { ApiProperty } from '@nestjs/swagger'
import type { Staff } from '@prisma/client'
import { PERMISSIONS, type Permission } from '../access'

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

  /** The id of the role this operator was assigned — provenance/display only. */
  @ApiProperty()
  roleId: string

  /** The name of the role this operator was assigned. Grants nothing by itself — see `permissions`. */
  @ApiProperty()
  role: string

  /** The permissions actually held by this operator. */
  @ApiProperty({ enum: PERMISSIONS, isArray: true })
  permissions: Permission[]

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
