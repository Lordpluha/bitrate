import { inject } from '@angular/core'
import { type CanActivateFn, Router } from '@angular/router'
import { AuthService } from './auth.service'

/**
 * Build-time switch, substituted by esbuild through `define` in `angular.json`.
 *
 * It is `true` **only** in the `development` configuration, and hardcoded `false` in both the
 * base options and the `production` configuration — and `ng build` defaults to production. So a
 * shipped bundle cannot carry the bypass no matter what anyone forgets: the branch below is
 * dead code that the optimizer drops, rather than a flag someone could flip in an env file.
 *
 * This exists so the panel can be looked at without a running API. It is not a login stub —
 * nothing about the real guard is weakened, and the API still rejects every unauthenticated
 * request on its own side.
 */
declare const NG_APP_AUTH_BYPASS: boolean

/** Placeholder operator shown while the bypass is on, so the shell renders its signed-in state. */
const BYPASS_STAFF = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'bypass@localhost',
  username: 'auth bypass',
  role: 'ADMIN',
} as const

/**
 * The session cookie is httpOnly, so the only way to know whether it is valid is to ask the API.
 * `loadCurrentStaff` swallows the failure and returns null, which is what a redirect wants.
 */
export const requireStaffSession: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService)
  const router = inject(Router)

  if (typeof NG_APP_AUTH_BYPASS !== 'undefined' && NG_APP_AUTH_BYPASS) {
    auth.useBypassStaff(BYPASS_STAFF)
    return true
  }

  if (auth.isAuthenticated()) return true
  if (await auth.loadCurrentStaff()) return true

  return router.createUrlTree(['/login'], { queryParams: { next: state.url } })
}
