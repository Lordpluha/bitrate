import { createRouter } from '@tanstack/react-router'
import { authRouteTree } from './authRoutes'
import { entityRoutes } from './entityRoutes'
import { legalRoute } from './legalRoute'
import { mainRoute } from './mainRoute'
import { mainScreens } from './mainScreens'
import { playlistRouteTree } from './playlistRoutes'
import { rootRoute } from './rootRoute'

const routeTree = rootRoute.addChildren([
  ...authRouteTree,
  legalRoute,
  mainRoute.addChildren([...mainScreens, ...entityRoutes, playlistRouteTree]),
])

/**
 * The renderer's router. URLs are web-player's (`ROUTES` from its shared layer), so a link a
 * reused view builds lands on the same screen here, and deep links map one-to-one.
 */
export const router = createRouter({
  routeTree,
  /** Views fetch their own data through React Query; loaders only guard and redirect. */
  defaultPreload: false,
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
