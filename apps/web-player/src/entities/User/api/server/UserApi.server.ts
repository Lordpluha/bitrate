import 'server-only'

import { publicUserResponseSchema } from '@entities/User/api/client/userResponse.schema'

/**
 * The current username of the listener with this id, or null when there is no such user.
 *
 * Raw fetch: the generated contract declares no path params for `GET /users/{id}`, so the
 * typed client cannot fill `{id}`. Uncached, because usernames can change; a server failure
 * throws, so the page shows its retry state instead of a false "not found".
 */
export const findUsernameByUserId = async (id: string) => {
  const response = await fetch(
    new URL(`/api/v1/users/${encodeURIComponent(id)}`, process.env.API_URL),
    { cache: 'no-store' },
  )

  if (response.status >= 500) {
    throw new Error(`User lookup failed with status ${response.status}`)
  }
  if (!response.ok) return null

  /* an unknown or deleted user answers 200 with an empty body */
  const text = await response.text()
  if (!text) return null
  const result = publicUserResponseSchema.safeParse(JSON.parse(text))
  return result.success ? result.data.username : null
}
