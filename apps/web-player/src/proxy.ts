import { ROUTES } from '@shared/routes'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Route guard for the web player.
 * Visitors without any session cookie are sent to login; everyone else passes
 * through. Signed-in users are intentionally *not* redirected away from the auth
 * pages — doing so loops forever once the access token expires but the cookie
 * is still present.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessToken = request.cookies.get('access_token')
  const refreshToken = request.cookies.get('refresh_token')
  const hasRecoverableSession = Boolean(accessToken || refreshToken)

  /** Auth screens plus the landing page are reachable without a session. */
  const publicRoutes = [
    ROUTES.auth.login,
    ROUTES.auth.twoFactorLogin,
    ROUTES.auth.registration,
    ROUTES.auth.forgotPassword,
    ROUTES.auth.resetPassword(),
    ROUTES.landing,
  ]

  const isPublicRoute = publicRoutes.some((route) => pathname === route)

  if (!hasRecoverableSession && !isPublicRoute) {
    return NextResponse.redirect(new URL(ROUTES.auth.login, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
