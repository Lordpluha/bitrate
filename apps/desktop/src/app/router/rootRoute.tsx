import { NotFoundView } from '@views/NotFound'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { RootErrorComponent } from './errorComponents'

/** The window's root: every screen renders inside it; unknown paths get the 404 view. */
export const rootRoute = createRootRoute({
  component: Outlet,
  errorComponent: RootErrorComponent,
  notFoundComponent: NotFoundView,
})
