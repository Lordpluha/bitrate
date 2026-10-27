import { SESSION_COOKIE_NAMES } from '@bitrate/contracts'
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
    const { access: accessCookieName, refresh: refreshCookieName } =
      SESSION_COOKIE_NAMES.artist

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
