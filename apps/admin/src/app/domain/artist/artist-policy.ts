import { POLICY_ALLOWED, type PolicyDecision } from '@domain/shared'
import { type Artist, isArtistActive } from './artist'

/** Only what the client can know locally — the API is still the enforcement point on a 409. */
export function canDeactivateArtist(artist: Artist): PolicyDecision {
  if (!isArtistActive(artist)) {
    return { allowed: false, reason: `${artist.username} is already deactivated.` }
  }

  return POLICY_ALLOWED
}

export function canRestoreArtist(artist: Artist): PolicyDecision {
  if (isArtistActive(artist)) {
    return { allowed: false, reason: `${artist.username} is not deactivated.` }
  }

  return POLICY_ALLOWED
}

/** Deactivating already revokes sessions — a deactivated account has none left to revoke. */
export function canRevokeArtistSessions(artist: Artist): PolicyDecision {
  if (!isArtistActive(artist)) {
    return {
      allowed: false,
      reason: `${artist.username} is deactivated; sessions were already revoked.`,
    }
  }

  return POLICY_ALLOWED
}

/** Verification cannot be changed on a deactivated account — the API refuses it with a 409. */
export function canChangeVerification(artist: Artist): PolicyDecision {
  if (!isArtistActive(artist)) {
    return { allowed: false, reason: `${artist.username} is deactivated.` }
  }

  return POLICY_ALLOWED
}
