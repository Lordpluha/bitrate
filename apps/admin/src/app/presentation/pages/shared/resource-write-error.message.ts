import { ActionNotAllowedError, ResourceWriteError } from '@domain/shared'

type ResourceWriteAction = 'deactivate' | 'reprocess' | 'restore' | 'revoke sessions for' | 'take down'

/**
 * What kind of write refused the request, for the two `ResourceWriteError` reasons whose wording
 * is resource-specific. Users and artists are "deactivated"/"restored"; tracks are "taken
 * down"/"restored" — the panel calls the same action a take-down, not a deactivation, everywhere
 * else on this screen, so the error text said something no button on the page ever did.
 */
type ResourceKind = 'account' | 'track'

type ResourceWriteMessageInput = {
  error: unknown
  action: ResourceWriteAction
  label: string
  /** Defaults to `'account'` — the wording `user-detail.ts`/`artist-detail.ts` already relied on. */
  resource?: ResourceKind
}

const ALREADY_REFUSED_WORDING: Record<ResourceKind, string> = {
  account: 'already deactivated',
  track: 'already taken down',
}

const NOT_REFUSED_WORDING: Record<ResourceKind, string> = {
  account: 'not deactivated',
  track: 'not taken down',
}

/**
 * Maps a failed take-down/restore/revoke-sessions write to operator-facing text. A 409 means the
 * resource's state already changed elsewhere — the caller reloads the detail view so the screen
 * catches up instead of leaving a stale confirm button on screen.
 */
export function resourceWriteErrorMessage({
  error,
  action,
  label,
  resource = 'account',
}: ResourceWriteMessageInput): string {
  if (error instanceof ActionNotAllowedError) {
    return error.message
  }

  if (error instanceof ResourceWriteError) {
    switch (error.reason) {
      case 'already-deactivated':
        return `${label} is ${ALREADY_REFUSED_WORDING[resource]} — reloaded.`
      case 'not-deactivated':
        return `${label} is ${NOT_REFUSED_WORDING[resource]} — reloaded.`
      case 'not-found':
        return `${label} could not be found — it may have been removed.`
      default:
        return `Could not ${action} ${label}.`
    }
  }

  return `Could not ${action} ${label}.`
}

/** Whether the message above means the detail view should reload rather than merely display the error. */
export function isStaleStateError(error: unknown): boolean {
  return (
    error instanceof ResourceWriteError &&
    (error.reason === 'already-deactivated' || error.reason === 'not-deactivated')
  )
}
