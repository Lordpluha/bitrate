import type { Middleware } from 'openapi-fetch'

/**
 * Sends the workspace language as `Accept-Language`, so the API words its errors in it rather
 * than in the browser's language. Read per request: the artist can switch language at any time.
 */
export function createLocaleMiddleware(locale: () => string): Middleware {
  return {
    onRequest({ request }) {
      request.headers.set('Accept-Language', locale())
      return request
    },
  }
}
