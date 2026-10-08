import { z } from 'zod'
import type {
  ArtistIdentity,
  ArtistSessionRequest,
  ArtistSessionResult,
  ForwardSessionCookies,
} from './artistSession.types'

const artistIdentitySchema = z.object({
  id: z.uuid(),
  username: z.string().min(1),
  avatar: z.string().nullable(),
}) satisfies z.ZodType<ArtistIdentity>

const SESSION_TIMEOUT_MS = 8_000

async function requestSessionApi(
  config: ArtistSessionRequest,
  path: string,
  cookie: string,
  method = 'GET',
): Promise<Response> {
  return fetch(new URL(path, config.apiUrl), {
    method,
    headers: { cookie },
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(SESSION_TIMEOUT_MS),
  })
}

async function readIdentity(response: Response): Promise<ArtistSessionResult> {
  if (!response.ok) return { status: 'unavailable' }
  const identity = artistIdentitySchema.safeParse(await response.json())
  return identity.success
    ? { status: 'authenticated', artist: identity.data }
    : { status: 'unavailable' }
}

/** Validates the API session; raw cookies are never included in the returned identity. */
export async function resolveArtistSession(
  config: ArtistSessionRequest,
  forwardCookies?: ForwardSessionCookies,
): Promise<ArtistSessionResult> {
  if (!config.refreshToken) return { status: 'unauthenticated' }

  try {
    if (config.accessToken) {
      const response = await requestSessionApi(
        config,
        '/api/v1/artists/auth/me',
        `${config.accessCookieName}=${encodeURIComponent(config.accessToken)}`,
      )
      if (response.status !== 401) return await readIdentity(response)
    }

    /** Forward only the required token; the API also matches any co-present token to the session. */
    const refreshed = await requestSessionApi(
      config,
      '/api/v1/artists/auth/refresh',
      `${config.refreshCookieName}=${encodeURIComponent(config.refreshToken)}`,
      'POST',
    )
    if (refreshed.status === 401 || refreshed.status === 403) {
      return { status: 'unauthenticated' }
    }
    if (!refreshed.ok) return { status: 'unavailable' }

    const cookies = refreshed.headers.getSetCookie()
    const accessCookie = cookies
      .map((cookie) => cookie.split(';')[0])
      .find((cookie) => cookie.startsWith(`${config.accessCookieName}=`))
    if (!accessCookie) return { status: 'unavailable' }
    forwardCookies?.(cookies)
    return await readIdentity(
      await requestSessionApi(config, '/api/v1/artists/auth/me', accessCookie),
    )
  } catch {
    return { status: 'unavailable' }
  }
}
