import { apiQueryKeys } from '@shared/api/queryKeys'
import { ROUTES } from '@shared/routes'
import { redirect } from '@tanstack/react-router'
import { queryClient } from '../providers/queryClient'
import { fetchSessionUser } from './fetchSessionUser'

/** A session the API has not confirmed — none, or one it could not be asked about. */
const toLogin = () => redirect({ href: ROUTES.auth.login, replace: true })

/**
 * Route guard for the player shell — desktop's counterpart of web-player's `proxy.ts`, which
 * sends visitors without a session to login before any screen renders.
 *
 * The session cookies are HttpOnly, so the renderer asks the API instead of reading them. A
 * cached user passes at once (navigating inside the shell costs nothing); otherwise the check
 * runs fresh, so a `null` cached before signing in never bounces a user who has just logged
 * in. The guard fails closed: when the API cannot confirm a session — including when it
 * cannot be reached — the shell is not shown, since none of its screens could load anyway.
 */
export const requireSession = async () => {
  if (queryClient.getQueryData(apiQueryKeys.auth.me)) return

  const user = await queryClient
    .fetchQuery({
      queryKey: apiQueryKeys.auth.me,
      queryFn: fetchSessionUser,
      staleTime: 0,
    })
    .catch(() => null)

  if (!user) throw toLogin()
}
