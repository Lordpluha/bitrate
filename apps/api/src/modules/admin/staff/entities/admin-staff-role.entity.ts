import { PERMISSIONS, type Permission } from '@modules/admin-auth'
import { ApiProperty } from '@nestjs/swagger'

/** The role an operator is assigned, as embedded on {@link AdminStaffEntity}. */
export class AdminStaffRoleEntity {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The name value. */
  @ApiProperty()
  name: string

  /** The role's current template — may differ from the operator's own `permissions`. */
  @ApiProperty({ enum: PERMISSIONS, isArray: true })
  permissions: Permission[]
}
