import { POLICY_ALLOWED, type PolicyDecision } from '@domain/shared'
import { isUserActive, type User } from './user'

/** Only what the client can know locally — the API is still the enforcement point on a 409. */
export function canDeactivateUser(user: User): PolicyDecision {
  if (!isUserActive(user)) {
    return { allowed: false, reason: `${user.username} is already deactivated.` }
  }

  return POLICY_ALLOWED
}

export function canRestoreUser(user: User): PolicyDecision {
  if (isUserActive(user)) {
    return { allowed: false, reason: `${user.username} is not deactivated.` }
  }

  return POLICY_ALLOWED
}

/** Deactivating already revokes sessions — a deactivated account has none left to revoke. */
export function canRevokeUserSessions(user: User): PolicyDecision {
  if (!isUserActive(user)) {
    return {
      allowed: false,
      reason: `${user.username} is deactivated; sessions were already revoked.`,
    }
  }

  return POLICY_ALLOWED
}
