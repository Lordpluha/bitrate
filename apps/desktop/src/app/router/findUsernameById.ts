/** Which public entity an id-shaped route segment may name. */
export type UsernameOwner = 'artists' | 'users'

const hasUsername = (value: unknown): value is { username: string } =>
  typeof value === 'object' &&
  value !== null &&
  'username' in value &&
  typeof value.username === 'string'

/**
 * The current username of the artist or listener an id names, or `null` when none does.
 *
 * Old links carried ids; web-player's page adapters redirect them on the server. The desktop
 * routes do the same lookup in `beforeLoad`, against the same public endpoints.
 */
export const findUsernameById = async (
  owner: UsernameOwner,
  id: string,
): Promise<string | null> => {
  const response = await fetch(`/api/v1/${owner}/${encodeURIComponent(id)}`, {
    credentials: 'include',
  })
  if (response.status >= 500) {
    throw new Error(`Username lookup failed with status ${response.status}`)
  }
  if (!response.ok) return null

  /* an unknown or deleted entity answers 200 with an empty body */
  const text = await response.text()
  if (!text) return null
  const body: unknown = JSON.parse(text)
  return hasUsername(body) ? body.username : null
}
