import type { Middleware } from 'openapi-fetch'

/** Endpoints whose 401 means "wrong credentials", never "expired session". */
const NO_REFRESH_PATHS = ['/auth/refresh', '/auth/login', '/auth/registration', '/auth/2fa/verify-login']

export type AuthRefreshDeps = {
  refresh: () => Promise<boolean>
  retry: (request: Request) => Promise<Response>
  onExpired: () => void
}

/**
 * On a 401 renews the session once and replays the original request; when the refresh itself
 * fails it reports the session as expired so the app can return to the login screen.
 */
export function createAuthRefreshMiddleware({ refresh, retry, onExpired }: AuthRefreshDeps): Middleware {
  const replays = new WeakMap<Request, Request>()

  return {
    onRequest({ request }) {
      replays.set(request, request.clone())
      return request
    },
    async onResponse({ request, response }) {
      const replay = replays.get(request)
      replays.delete(request)
      if (response.status !== 401) return response
      if (NO_REFRESH_PATHS.some((path) => request.url.includes(path))) return response

      if (await refresh()) return replay ? retry(replay) : response

      onExpired()
      return response
    },
  }
}
