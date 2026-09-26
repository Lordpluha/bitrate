import { PERMISSIONS, type Permission } from '@modules/admin-auth'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { AdminStaffRoleEntity } from './admin-staff-role.entity'

/** An operator as seen by the operator surface — never includes secrets. */
export class AdminStaffEntity {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The email value. */
  @ApiProperty()
  email: string

  /** The username value. */
  @ApiProperty()
  username: string

  /** The role this operator is assigned, embedded so the panel can compute divergence from
   * `permissions` without an extra request. */
  @ApiProperty({ type: AdminStaffRoleEntity })
  role: AdminStaffRoleEntity

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
  @ApiPropertyOptional({ nullable: true })
  lockedUntil: Date | null

  /** Soft-delete (deactivation) timestamp. */
  @ApiPropertyOptional({ nullable: true })
  deletedAt: Date | null

  /** The created at value. */
  @ApiProperty()
  createdAt: Date

  /** The updated at value. */
  @ApiProperty()
  updatedAt: Date
}
