/** The listener's support conversation, kept in the browser so a reload finds it again. */
export interface SupportSession {
  id: string
  /** Guest access token; absent when the conversation belongs to the signed-in listener. */
  token?: string
}

/** Input of {@link saveSupportSession}. */
export interface SaveSupportSessionInput {
  session: SupportSession
}

const KEY = 'bitrate:support:listener'

/** The saved session; `undefined` when there is none, storage is blocked or the value is corrupt. */
export function readSupportSession(): SupportSession | undefined {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (typeof value !== 'object' || value === null || !('id' in value))
      return undefined
    if (typeof value.id !== 'string') return undefined
    const token =
      'token' in value && typeof value.token === 'string'
        ? value.token
        : undefined
    return token ? { id: value.id, token } : { id: value.id }
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
