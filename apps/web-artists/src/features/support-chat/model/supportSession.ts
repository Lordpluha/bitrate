/** The artist's support conversation, kept for this browser session: a reload finds it, closing the tab ends it. */
export interface SupportSession {
  id: string
  /** Guest access token: the API links artists to conversations only through it for now. */
  token?: string
  /** Artist id, or `guest`: a session is never reopened for anyone else on this browser. */
  owner: string
}

const KEY = 'bitrate:support:artist'

/** The saved session; `undefined` when there is none, storage is blocked or the value is corrupt. */
export function readSupportSession(owner: string): SupportSession | undefined {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(KEY) ?? 'null')
    if (typeof value !== 'object' || value === null || !('id' in value))
      return undefined
    if (
      typeof value.id !== 'string' ||
      !('owner' in value) ||
      value.owner !== owner
    ) {
      return undefined
    }
    const token =
      'token' in value && typeof value.token === 'string'
        ? value.token
        : undefined
    return token ? { id: value.id, token, owner } : { id: value.id, owner }
  } catch {
    return undefined
  }
}

/** Saves the session; without storage it lasts until the page closes. */
export function saveSupportSession(session: SupportSession): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(session))
  } catch {
    // Storage blocked: nothing else depends on it.
  }
}

/** Forgets the session, so the next message starts a new conversation. */
export function clearSupportSession(): void {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // Storage blocked: there is nothing to clear.
  }
}
