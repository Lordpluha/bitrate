'use client'

import type { ApiPaths } from '@spotify/contracts'
import { ROUTES } from '@shared/routes'
import createClient, { type Middleware } from 'openapi-fetch'

// Состояние refresh запроса для предотвращения гонки
let refreshPromise: Promise<boolean> | null = null

async function refreshToken(): Promise<boolean> {
  // Если refresh уже выполняется, ждём его завершения
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`, {
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

// Middleware для автоматического refresh при 401
const authRefreshMiddleware: Middleware = {
  async onResponse({ request, response }) {
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
        // Клонируем request для повторного использования
        const clonedRequest = request.clone()

        // Повторяем оригинальный запрос после успешного refresh
        const retryResponse = await fetch(clonedRequest)

        return retryResponse
      }

      // Refresh не удался - очищаем cookies и редиректим на логин
      if (typeof window !== 'undefined') {
        // Удаляем просроченные токены из cookies
        document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'

        // Редиректим на логин ТОЛЬКО если мы еще не на странице авторизации
        const currentPath = window.location.pathname
        const isOnAuthPage = currentPath.startsWith('/auth/')

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
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
})

// Регистрируем middleware
clientFetchClient.use(authRefreshMiddleware)