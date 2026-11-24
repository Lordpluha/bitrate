/** The listener's support conversation, kept in the browser so a reload finds it again. */
export interface SupportSession {
  id: string
  /** Guest access token; absent when the conversation belongs to the signed-in listener. */
  token?: string
  /** User id, or `guest`: a session is never reopened for anyone else on this browser. */
  owner: string
}

/** Input of {@link readSupportSession}. */
export interface ReadSupportSessionInput {
  owner: string
}

/** Input of {@link saveSupportSession}. */
export interface SaveSupportSessionInput {
  session: SupportSession
}

const KEY = 'bitrate:support:listener'

/**
 * The session saved by the same owner; `undefined` when there is none, it belongs to someone
 * else (a shared device after sign-out), storage is blocked or the value is corrupt.
 */
export function readSupportSession({
  owner,
}: ReadSupportSessionInput): SupportSession | undefined {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (
      typeof value !== 'object' ||
      value === null ||
      !('id' in value) ||
      !('owner' in value)
    ) {
      return undefined
    }
    if (typeof value.id !== 'string' || value.owner !== owner) return undefined
    const token =
      'token' in value && typeof value.token === 'string'
        ? value.token
        : undefined
    return token ? { id: value.id, token, owner } : { id: value.id, owner }
  } catch {
    return undefined
  }
}

/** Saves the session; without storage the conversation simply lasts until the page closes. */
export function saveSupportSession({ session }: SaveSupportSessionInput): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(session))
  } catch {
    /** Storage blocked: nothing else depends on it. */
  }
}

/** Forgets the session, so the next message starts a new conversation. */
export function clearSupportSession(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /** Storage blocked: there is nothing to clear. */
  }
}
