import type { Permission } from './permissions'

/** The staff shape {@link hasPermission} needs — a slice of the authenticated staff record. */
export type PermissionCheckStaff = {
  permissions: string[]
  role: { name: string; builtIn: boolean }
}

/** Input to {@link hasPermission}. */
export type HasPermissionInput = {
  staff: PermissionCheckStaff
  permission: Permission
}

/**
 * Checks whether a staff member holds a permission.
 *
 * The built-in ADMIN role passes every check by identity — its own `permissions` array is
 * stored empty and is never consulted. Everyone else needs the permission listed on their own
 * record; an unknown string stored there (stale catalogue entry) is ignored, not thrown on.
 */
export function hasPermission({ staff, permission }: HasPermissionInput): boolean {
  if (staff.role.builtIn && staff.role.name === 'ADMIN') return true
  return staff.permissions.includes(permission)
}
