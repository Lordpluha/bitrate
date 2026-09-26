import { BUILT_IN_ADMIN_ROLE_NAME, type RolePolicyDecision } from '@domain/role'
import type { StaffMember } from './staff-member'

const ALLOWED: RolePolicyDecision = { allowed: true }

/**
 * An operator assigned the built-in `ADMIN` role holds every permission by identity (see
 * `hasPermission`) and their `permissions` field is never populated — there is nothing
 * meaningful to edit individually for them.
 */
export function canEditPermissions(member: StaffMember): RolePolicyDecision {
  if (member.role.name === BUILT_IN_ADMIN_ROLE_NAME) {
    return {
      allowed: false,
      reason:
        'The built-in ADMIN role always holds every permission and cannot have its permissions edited individually.',
    }
  }

  return ALLOWED
}

/**
 * Only what the client can know locally — an operator already deactivated. Whether this
 * deactivation would leave no active operator holding the ADMIN role is enforced server-side
 * and surfaces as `StaffWriteError('last-admin')` from the write itself.
 */
export function canDeactivate(member: StaffMember): RolePolicyDecision {
  if (member.deactivatedAt !== null) {
    return { allowed: false, reason: `${member.username} is already deactivated.` }
  }

  return ALLOWED
}
