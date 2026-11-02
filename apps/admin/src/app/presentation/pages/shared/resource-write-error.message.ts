import { ActionNotAllowedError, ResourceWriteError } from '@domain/shared'

type ResourceWriteAction =
  'deactivate' | 'hide' | 'reprocess' | 'restore' | 'revoke sessions for' | 'take down' | 'unhide'

/**
 * What kind of write refused the request, for the two `ResourceWriteError` reasons whose wording
 * is resource-specific. Users and artists are "deactivated"/"restored"; tracks are "taken
 * down"/"restored" — the panel calls the same action a take-down, not a deactivation, everywhere
 * else on this screen, so the error text said something no button on the page ever did.
 */
type ResourceKind = 'account' | 'album' | 'playlist' | 'track'

/** Operator-facing copy as a transloco key and its parameters; the page translates it on show. */
export type Notice = {
  key: string
  params?: Record<string, string | number>
}

type ResourceWriteMessageInput = {
  error: unknown
  action: ResourceWriteAction
  /** How the page names the record, quotes included — `"Night Drive"`. */
  label: string
  /** Defaults to `'account'` — the wording `user-detail.ts`/`artist-detail.ts` already relied on. */
  resource?: ResourceKind
}

const ALREADY_REFUSED_KEY: Record<ResourceKind, string> = {
  account: 'ui.write.already.account',
  album: 'ui.write.already.item',
  playlist: 'ui.write.already.item',
  track: 'ui.write.already.item',
}

const NOT_REFUSED_KEY: Record<ResourceKind, string> = {
  account: 'ui.write.not.account',
  album: 'ui.write.not.item',
  playlist: 'ui.write.not.item',
  track: 'ui.write.not.item',
}

const FAILED_KEY: Record<ResourceWriteAction, string> = {
  deactivate: 'ui.write.failed.deactivate',
  hide: 'ui.write.failed.hide',
  reprocess: 'ui.write.failed.reprocess',
  restore: 'ui.write.failed.restore',
  'revoke sessions for': 'ui.write.failed.revokeSessions',
  'take down': 'ui.write.failed.takeDown',
  unhide: 'ui.write.failed.unhide',
}

/**
 * Maps a failed take-down/restore/revoke-sessions write to operator-facing copy. A 409 means the
 * resource's state already changed elsewhere — the caller reloads the detail view so the screen
 * catches up instead of leaving a stale confirm button on screen.
 */
export function resourceWriteError({
  error,
  action,
  label,
  resource = 'account',
}: ResourceWriteMessageInput): Notice {
  const params = { label }
  if (error instanceof ActionNotAllowedError) return { key: 'ui.write.notAllowed', params }

  if (error instanceof ResourceWriteError) {
    switch (error.reason) {
      case 'already-deactivated':
        return { key: ALREADY_REFUSED_KEY[resource], params }
      case 'not-deactivated':
        return { key: NOT_REFUSED_KEY[resource], params }
      case 'visibility-conflict':
        return { key: 'ui.write.visibility', params }
      case 'not-found':
        return { key: 'ui.write.notFound', params }
      default:
        return { key: FAILED_KEY[action], params }
    }
  }

  return { key: FAILED_KEY[action], params }
}

/** Whether the error means the detail view should reload rather than merely display it. */
export function isStaleStateError(error: unknown): boolean {
  return (
    error instanceof ResourceWriteError &&
    (error.reason === 'already-deactivated' ||
      error.reason === 'not-deactivated' ||
      error.reason === 'visibility-conflict')
  )
}
