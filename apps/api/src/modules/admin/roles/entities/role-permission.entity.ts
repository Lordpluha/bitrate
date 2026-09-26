import { PERMISSIONS, type Permission } from '@modules/admin-auth'
import { ApiProperty } from '@nestjs/swagger'

/** One entry in the permission catalogue, with how many active operators currently hold it. */
export class RolePermissionEntity {
  /** The permission id. */
  @ApiProperty({ enum: PERMISSIONS })
  id: Permission

  /** Active, non-`ADMIN` operators currently holding this permission. Zero means only the
   * built-in `ADMIN` role can exercise it today. */
  @ApiProperty()
  heldBy: number

  /** Whether this permission is grantable only to the built-in `ADMIN` role by identity. */
  @ApiProperty()
  protected: boolean
}
