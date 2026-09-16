import { inject } from '@angular/core'
import { type CanActivateFn, Router } from '@angular/router'
import { RestoreSessionUseCase, SessionStore } from '@application/session'

/**
 * The session cookie is httpOnly, so the only way to know whether it is valid is to ask the API.
 * `RestoreSessionUseCase` resolves to null rather than throwing, which is what a redirect wants.
 */
export const requireStaffSession: CanActivateFn = async (_route, state) => {
  const store = inject(SessionStore)
  const restore = inject(RestoreSessionUseCase)
  const router = inject(Router)

  if (store.isSignedIn()) return true
  if (await restore.execute()) return true

  return router.createUrlTree(['/login'], { queryParams: { next: state.url } })
}
