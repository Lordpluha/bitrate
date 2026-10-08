import { createServerFn } from '@tanstack/react-start'
import {
  getCookie,
  getResponseHeaders,
  setResponseHeader,
} from '@tanstack/react-start/server'
import { getArtistApiUrl } from './artistApiUrl'
import { resolveArtistSession } from './artistSession'

/** POST allows a valid refresh session to rotate cookies without caching private data. */
export const getArtistSession = createServerFn({ method: 'POST' }).handler(
  async () => {
    setResponseHeader('Cache-Control', 'private, no-store')
    const accessCookieName = process.env.ACCESS_TOKEN_NAME || 'access_token'
    const refreshCookieName = process.env.REFRESH_TOKEN_NAME || 'refresh_token'

    return resolveArtistSession(
      {
        apiUrl: getArtistApiUrl(),
        accessCookieName,
        refreshCookieName,
        accessToken: getCookie(accessCookieName),
        refreshToken: getCookie(refreshCookieName),
      },
      (cookies) => {
        const headers = getResponseHeaders()
        for (const cookie of cookies) headers.append('Set-Cookie', cookie)
      },
    )
  },
)
