import MainLayout from '@app/main/layout'
import { ROUTES } from '@shared/routes'
import { createRoute, Outlet } from '@tanstack/react-router'
import { rootRoute } from './rootRoute'
import { type ScreenComponent, ScreenErrorComponent } from './errorComponents'

/**
 * The player shell — header, library, Now Playing and the player bar — is web-player's own
 * `app/main/layout.tsx`, reused as-is so both surfaces share one shell.
 */
export const mainRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/main',
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
