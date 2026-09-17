import { inject } from '@angular/core'
import { type CanActivateFn, Router } from '@angular/router'
import { RestoreSessionUseCase, SessionStore } from '@application/session'
import type { Permission } from '@domain/access'
import { ROUTE_PERMISSIONS } from './route-permissions'

/**
 * Gates a route on a permission. Cosmetic, like `SessionStore.can` — the API re-checks every
 * request on its own regardless of what this guard decides.
 *
 * It must not assume `requireStaffSession` has already filled the store. Angular invokes every
 * guard in a `canActivate` array at once and only prioritises their *results* in array order, so
 * on a cold page load this guard runs while the store is still empty. Reading it synchronously
 * sent every operator to `/no-access` on every refresh, administrators included. So it restores
 * the session itself when needed — sharing the in-flight `/me` request, not issuing a second.
 *
 * `/` is itself a guarded route now (the overview dashboard, `overview:read`), not a redirect to
 * `moderation`. On denial this guard looks (in nav order, via `ROUTE_PERMISSIONS`) for the first
 * guarded route the operator *can* reach and sends them there — the route just denied can never
 * be the match, since `can()` already found it `false` for this operator, so the search never
 * bounces back to the route it started from. With none reachable it sends them to `/no-access`,
 * which is gated only by `requireStaffSession` and can therefore never itself trigger another
 * redirect.
 */
export const requirePermission = (permission: Permission): CanActivateFn => {
  return async () => {
    const session = inject(SessionStore)
    const restore = inject(RestoreSessionUseCase)
    const router = inject(Router)

    if (!session.isSignedIn()) await restore.execute()

    if (session.can(permission)()) return true

    const reachable = ROUTE_PERMISSIONS.find((candidate) => session.can(candidate.permission)())

    return router.createUrlTree([reachable?.path ?? '/no-access'])
  }
}
