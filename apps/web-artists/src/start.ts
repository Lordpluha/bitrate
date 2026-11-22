import {
  sentryGlobalFunctionMiddleware,
  sentryGlobalRequestMiddleware,
} from '@sentry/tanstackstart-react'
import { createCsrfMiddleware, createStart } from '@tanstack/react-start'

/**
 * A custom `src/start.ts` replaces Start's defaults, including the CSRF check it puts on server
 * functions — and this app has server functions (session, sign-in, locale). This is the same
 * middleware with the same filter Start applies when there is no `start.ts`.
 *
 * Kept in a variable: Sentry's Vite plugin does not instrument a middleware array that contains a
 * function call.
 */
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
})

/** Sentry's middlewares go first so they see every error, server function calls included. */
export const startInstance = createStart(() => ({
  requestMiddleware: [sentryGlobalRequestMiddleware, csrfMiddleware],
  functionMiddleware: [sentryGlobalFunctionMiddleware],
}))
