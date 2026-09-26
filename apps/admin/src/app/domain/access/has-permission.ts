import type { Permission } from './permission'

type HasPermissionInput = {
  staff: { roleName: string; permissions: readonly Permission[] } | null
  permission: Permission
}

/**
 * Whether the signed-in operator may see/do something gated by `permission`.
 *
 * This is a **cosmetic** check only — it decides what the panel renders, nothing more. The
 * client only ever sees the role's name, never its own permission set re-derived server-side, so
 * the `roleName === 'ADMIN'` short-circuit is a display convenience: a custom role cannot take
 * the name `ADMIN` because role names are unique and the built-in role already holds it. The API
 * is the real enforcement point and re-checks every request on its own regardless of what this
 * function returns.
 */
export function hasPermission({ staff, permission }: HasPermissionInput): boolean {
  if (staff === null) return false
  if (staff.roleName === 'ADMIN') return true

  return staff.permissions.includes(permission)
}
