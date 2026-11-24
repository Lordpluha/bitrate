import { API_BASE_URL } from './config'
import { refreshSession } from './refresh-session'
import { sessionEvents } from './session-events'

/**
 * A raw GET through the same session rules as `api`, for the few paths whose generated contract
 * is wrong (e.g. `GET /albums/{id}` declares no path parameter). Prefer `api` everywhere else,
 * and validate the body with a schema — nothing here is typed.
 */
export async function apiFetch(path: string): Promise<Response> {
  const send = () => fetch(`${API_BASE_URL}${path}`, { credentials: 'include' })

  const response = await send()
  if (response.status !== 401) return response
  if (await refreshSession()) return send()

  sessionEvents.emitExpired()
  return response
}
