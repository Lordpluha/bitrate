'use client'

import { ROUTES } from '@shared/routes/routes'
import type { ApiPaths } from '@spotify/contracts'
import createClient, { type Middleware } from 'openapi-fetch'

let refreshPromise: Promise<boolean> | null = null
const retryRequests = new WeakMap<Request, Request>()

export const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
).replace(/\/$/, '')

async function refreshToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/v1/artists/auth/refresh`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        },
      )

      return response.ok
    } catch (error) {
      console.error('Refresh token error:', error)
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

const authRefreshMiddleware: Middleware = {
  onRequest({ request }) {
    retryRequests.set(request, request.clone())
    return request
  },
  async onResponse({ request, response }) {
    const retryRequest = retryRequests.get(request)
    retryRequests.delete(request)

    if (response.status === 401) {
      if (
        request.url.includes('/artists/auth/refresh') ||
        request.url.includes('/artists/auth/login') ||
        request.url.includes('/artists/auth/registration')
      ) {
        return response
      }

      const refreshSuccess = await refreshToken()

      if (refreshSuccess) {
        if (!retryRequest) return response
        const retryResponse = await fetch(retryRequest)
        return retryResponse
      }

      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        const isOnAuthPage =
          currentPath.startsWith('/auth/') ||
          currentPath === '/login' ||
          currentPath === '/registration'

        if (!isOnAuthPage) {
          window.location.href = ROUTES.auth.login
        }
      }

      return response
    }

    return response
  },
}

export const clientFetchClient = createClient<ApiPaths>({
  baseUrl: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
})

clientFetchClient.use(authRefreshMiddleware)
