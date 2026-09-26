import { diffFromTemplate, type PermissionDiff } from '@domain/access'
import { BUILT_IN_ADMIN_ROLE_NAME } from '@domain/role'
import type { StaffMember } from './staff-member'

/**
 * How an operator's own permissions differ from their role's current template — the same
 * set-based comparison the roles screen was built with, reused rather than re-derived.
 *
 * `null` for a built-in ADMIN holder: their `permissions` field is never populated, and
 * comparing it against the template would manufacture a spurious "missing everything" diff.
 */
export function permissionDivergence(member: StaffMember): PermissionDiff | null {
  if (member.role.name === BUILT_IN_ADMIN_ROLE_NAME) return null

  return diffFromTemplate({ permissions: member.permissions, template: member.role.permissions })
}
