import MainLayout from '@app/main/layout'
import { ROUTES } from '@shared/routes'
import { createRoute, Outlet } from '@tanstack/react-router'
import { requireSession } from '../session/requireSession'
import { type ScreenComponent, ScreenErrorComponent } from './errorComponents'
import { rootRoute } from './rootRoute'

/**
 * The player shell — header, library, Now Playing and the player bar — is web-player's own
 * `app/main/layout.tsx`, reused as-is so both surfaces share one shell. Signed-out visitors
 * never reach it: the guard sends them to login first, as web-player's `proxy.ts` does.
 */
export const mainRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/main',
  beforeLoad: requireSession,
  component: () => (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ),
})

/** `/main/library` → `library`: child routes are declared relative to the shell. */
export const toShellPath = (path: string) =>
  path === ROUTES.main ? '/' : path.slice(ROUTES.main.length + 1)

/**
 * A screen inside the shell, by its absolute web-player route. A failing screen shows web-player's in-shell error state, so the
 * player keeps playing and the library stays usable, as with Next's nested `error.tsx`.
 */
export const mainScreen = (path: string, component: ScreenComponent) =>
  createRoute({
    getParentRoute: () => mainRoute,
    path: toShellPath(path),
    component,
    errorComponent: ScreenErrorComponent,
  })
