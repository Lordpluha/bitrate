import { API_BASE_URL } from './config'

/** The in-flight refresh, shared so a burst of 401s triggers a single refresh call. */
let inFlight: Promise<boolean> | null = null

async function requestRefresh(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
    return response.ok
  } catch {
    return false
  } finally {
    inFlight = null
  }
}

/**
 * Renews the session cookies through `POST /auth/refresh`. The refresh cookie lives in the
 * platform's native cookie store (NSHTTPCookieStorage / Android CookieManager), so it persists
 * across launches without the app ever reading it.
 */
export function refreshSession(): Promise<boolean> {
  inFlight ??= requestRefresh()
  return inFlight
}
