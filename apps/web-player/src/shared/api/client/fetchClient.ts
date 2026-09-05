'use client'

import type { ApiPaths } from '@bitrate/contracts'
import { ROUTES } from '@shared/routes'
import createClient, { type Middleware } from 'openapi-fetch'

/** Shared refresh state so concurrent 401s trigger only one refresh call. */
let refreshPromise: Promise<boolean> | null = null
const retryRequests = new WeakMap<Request, Request>()
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')

async function refreshToken(): Promise<boolean> {
  /** A refresh is already in flight — reuse its promise. */
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        return false
      }

      return true
    } catch (error) {
      console.error('Refresh token error:', error)
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

const redirectToLogin = () => {
  if (typeof window === 'undefined') return
  if (!window.location.pathname.startsWith('/auth/')) {
    window.location.href = ROUTES.auth.login
  }
}

/** Runs a raw request through the same refresh-and-retry flow as the OpenAPI client. */
export async function fetchWithAuthRefresh(
  input: RequestInfo | URL,
  init: RequestInit = {},
) {
  const request = () =>
    fetch(input, {
      ...init,
      credentials: init.credentials ?? 'include',
    })

  let response = await request()
  if (response.status !== 401) return response

  const requestUrl = input instanceof Request ? input.url : input.toString()
  if (requestUrl.includes('/auth/')) return response

  if (await refreshToken()) {
    response = await request()
    return response
  }

  redirectToLogin()
  return response
}

/** Middleware that transparently refreshes the session on a 401. */
const authRefreshMiddleware: Middleware = {
  onRequest({ request }) {
    retryRequests.set(request, request.clone())
    return request
  },
  async onResponse({ request, response }) {
    const retryRequest = retryRequests.get(request)
    retryRequests.delete(request)
    /** Only 401 responses are recoverable by refreshing. */
    if (response.status === 401) {
      /** Auth endpoints are skipped, otherwise refresh would loop forever. */
      if (
        request.url.includes('/auth/refresh') ||
        request.url.includes('/auth/login') ||
        request.url.includes('/auth/registration')
      ) {
        return response
      }

      /** Try to renew the session before replaying the request. */
      const refreshSuccess = await refreshToken()

      if (refreshSuccess) {
        if (!retryRequest) return response

        const retryResponse = await fetch(retryRequest)

        return retryResponse
      }

      /** Refresh failed — clear cookies and send the user back to login. */
      redirectToLogin()
      return response
    }

    return response
  },
}

export const clientFetchClient = createClient<ApiPaths>({
  baseUrl: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
})

/** Registers the refresh middleware on the shared client. */
clientFetchClient.use(authRefreshMiddleware)
