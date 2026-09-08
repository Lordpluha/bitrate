import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

/**
 * Start calls this once per request on the server and once on the client, so it must return a
 * fresh instance every time — a module-level singleton would leak one visitor's loader data
 * into the next request's SSR render.
 */
export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
