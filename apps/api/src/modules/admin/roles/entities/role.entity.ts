import { PERMISSIONS, type Permission } from '@modules/admin-auth'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/**
 * A role template, with operator counts. `holders` is every active operator currently
 * assigned this role; `divergentHolders` is the subset whose own `permissions` no longer
 * match the template — because editing a template never reaches operators already assigned
 * it.
 */
export class RoleEntity {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The name value. */
  @ApiProperty()
  name: string

  /** The description value. */
  @ApiPropertyOptional({ nullable: true })
  description: string | null

  /** Whether this is a built-in role (`ADMIN` or `MODERATOR`). */
  @ApiProperty()
  builtIn: boolean

  /** The permissions this template grants when assigned. */
  @ApiProperty({ enum: PERMISSIONS, isArray: true })
  permissions: Permission[]

  /** Active operators currently assigned this role. */
  @ApiProperty()
  holders: number

  /** Active holders whose own permission set no longer matches this template. */
  @ApiProperty()
  divergentHolders: number

  /** The created at value. */
  @ApiProperty()
  createdAt: Date

  /** The updated at value. */
  @ApiProperty()
  updatedAt: Date
}
