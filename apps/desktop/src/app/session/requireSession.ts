import { apiQueryKeys } from '@shared/api/queryKeys'
import { ROUTES } from '@shared/routes'
import { redirect } from '@tanstack/react-router'
import { queryClient } from '../providers/queryClient'
import { fetchSessionUser } from './fetchSessionUser'

/**
 * Route guard for the player shell — desktop's counterpart of web-player's `proxy.ts`, which
 * sends visitors without a session to login before any screen renders.
 *
 * The session cookies are HttpOnly, so the renderer asks the API instead of reading them. A
 * cached user passes at once (navigating inside the shell costs nothing); otherwise the check
 * runs fresh, so a `null` cached before signing in never bounces a user who has just logged
 * in. When the API cannot be reached the guard lets the shell render, and its screens show
 * their own error states rather than a login form that could not work either.
 */
export const requireSession = async () => {
  if (queryClient.getQueryData(apiQueryKeys.auth.me)) return

  let user: Awaited<ReturnType<typeof fetchSessionUser>>
  try {
    user = await queryClient.fetchQuery({
      queryKey: apiQueryKeys.auth.me,
      queryFn: fetchSessionUser,
      staleTime: 0,
    })
  } catch {
    return
  }

  if (!user) throw redirect({ href: ROUTES.auth.login, replace: true })
}
