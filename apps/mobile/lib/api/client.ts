import type { ApiPaths } from '@bitrate/contracts'
import createClient from 'openapi-fetch'

import { createAuthRefreshMiddleware } from './auth-refresh-middleware'
import { API_BASE_URL } from './config'
import { refreshSession } from './refresh-session'
import { sessionEvents } from './session-events'

/**
 * The one typed client for the Bitrate API. Paths, params and bodies are checked against the
 * generated contracts; session cookies ride on the native cookie store (`credentials: include`).
 */
export const api = createClient<ApiPaths>({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
})

api.use(
  createAuthRefreshMiddleware({
    refresh: refreshSession,
    retry: (request) => fetch(request),
    onExpired: sessionEvents.emitExpired,
  }),
)
