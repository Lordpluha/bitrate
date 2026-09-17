import type { Permission } from '@domain/access'

/** One entry in the permission catalogue: a permission plus how many operators hold it today. */
export type PermissionCatalogueEntry = {
  permission: Permission
  /** Active, non-`ADMIN` operators currently holding this permission. */
  heldBy: number
  /** Whether this permission is grantable only to the built-in `ADMIN` role by identity. */
  protected: boolean
}
