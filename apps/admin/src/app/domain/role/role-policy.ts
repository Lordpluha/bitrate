import { BUILT_IN_ADMIN_ROLE_NAME } from './role'
import type { Role } from './role'

/** Whether an action on a role is allowed, and — when it is not — why, for the UI to say so. */
export type RolePolicyDecision = { allowed: true } | { allowed: false; reason: string }

const ALLOWED: RolePolicyDecision = { allowed: true }

/**
 * The built-in `ADMIN` role holds every permission by identity (see `hasPermission`) and its
 * own `permissions` field is never read — there is nothing meaningful to edit. `MODERATOR`'s
 * description and permissions may be edited; only its name is fixed (see `canRenameRole`).
 */
export function canEditRole(role: Role): RolePolicyDecision {
  if (role.builtIn && role.name === BUILT_IN_ADMIN_ROLE_NAME) {
    return {
      allowed: false,
      reason: 'The built-in ADMIN role always holds every permission and cannot be edited.',
    }
  }

  return ALLOWED
}

/** Role identity for a built-in role is its name — the API rejects renaming either of them. */
export function canRenameRole(role: Role): RolePolicyDecision {
  if (role.builtIn) {
    return { allowed: false, reason: 'A built-in role cannot be renamed.' }
  }

  return ALLOWED
}

/**
 * A built-in role can never be deleted. A custom role can, but only once no active operator is
 * still assigned it — deleting it out from under a holder would leave that operator with no
 * role at all.
 */
export function canDeleteRole(role: Role): RolePolicyDecision {
  if (role.builtIn) {
    return { allowed: false, reason: 'Built-in roles cannot be deleted.' }
  }

  if (role.holders > 0) {
    const noun = role.holders === 1 ? 'operator' : 'operators'
    return { allowed: false, reason: `${role.holders} active ${noun} still hold this role.` }
  }

  return ALLOWED
}
