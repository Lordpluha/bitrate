import { inject } from '@angular/core'
import { type CanActivateFn, Router } from '@angular/router'
import { AuthService } from './auth.service'

/**
 * The session cookie is httpOnly, so the only way to know whether it is valid is to ask the API.
 * `loadCurrentStaff` swallows the failure and returns null, which is what a redirect wants.
 */
export const requireStaffSession: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService)
  const router = inject(Router)

  if (auth.isAuthenticated()) return true
  if (await auth.loadCurrentStaff()) return true

  return router.createUrlTree(['/login'], { queryParams: { next: state.url } })
}
