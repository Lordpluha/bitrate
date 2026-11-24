import { clientFetchClient } from '@shared/api/client'

/**
 * The signed-in listener, or `null` when there is no session.
 *
 * The same request and the same semantics as web-player's `useAuth` query, so the result can
 * share its `auth.me` cache entry: a 401 resolves to `null` (the client's middleware has
 * already tried a refresh), any other failure throws.
 */
export const fetchSessionUser = async () => {
  const { data, response } = await clientFetchClient.GET('/api/v1/auth/me')

  if (!response.ok && response.status !== 401) {
    throw new Error(`Session check failed with status ${response.status}`)
  }
  return data ?? null
}
