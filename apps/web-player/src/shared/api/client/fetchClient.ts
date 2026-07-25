'use client'

import { ROUTES } from '@shared/routes'
import type { ApiPaths } from '@spotify/contracts'
import createClient, { type Middleware } from 'openapi-fetch'

// Состояние refresh запроса для предотвращения гонки
let refreshPromise: Promise<boolean> | null = null
const retryRequests = new WeakMap<Request, Request>()
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')

async function refreshToken(): Promise<boolean> {
  // Если refresh уже выполняется, ждём его завершения
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

// Middleware для автоматического refresh при 401
const authRefreshMiddleware: Middleware = {
  onRequest({ request }) {
    retryRequests.set(request, request.clone())
    return request
  },
  async onResponse({ request, response }) {
    const retryRequest = retryRequests.get(request)
    retryRequests.delete(request)
    // Проверяем на 401 ошибку
    if (response.status === 401) {
      // Не пытаемся refresh для auth endpoints, чтобы избежать бесконечных циклов
      if (
        request.url.includes('/auth/refresh') ||
        request.url.includes('/auth/login') ||
        request.url.includes('/auth/registration')
      ) {
        return response
      }

      // Пытаемся обновить токен
      const refreshSuccess = await refreshToken()

      if (refreshSuccess) {
        if (!retryRequest) return response

        const retryResponse = await fetch(retryRequest)

        return retryResponse
      }

      // Refresh не удался - очищаем cookies и редиректим на логин
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

// Регистрируем middleware
clientFetchClient.use(authRefreshMiddleware)
