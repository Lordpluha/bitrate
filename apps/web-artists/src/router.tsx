import * as Sentry from '@sentry/tanstackstart-react'
import { PagePending } from '@shared/ui/Loading'
import { NotFound } from '@shared/ui/NotFound'
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

/**
 * Start calls this once per request on the server and once on the client, so it must return a
 * fresh instance every time — a module-level singleton would leak one visitor's loader data
 * into the next request's SSR render.
 */
export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPendingComponent: PagePending,
    defaultPendingMs: 150,
    defaultPendingMinMs: 0,
    /** Without this every miss renders TanStack Router's bare <p>Not Found</p>. */
    defaultNotFoundComponent: NotFound,
    defaultPreload: 'intent',
  })
  /** Turns client navigations into Sentry spans; the server traces requests in `server.ts`. */
  if (!router.isServer) {
    Sentry.addIntegration(
      Sentry.tanstackRouterBrowserTracingIntegration(router),
    )
  }
  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
