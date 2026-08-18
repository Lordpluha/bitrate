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
  /**
   * Everything not matched here bypasses the guard.
   *
   * `webmanifest`, `txt` and `xml` matter as much as the image extensions: a
   * browser fetches `/manifest.webmanifest` without credentials, so guarding it
   * answers with a redirect to the login page, the browser fails to parse that
   * as JSON, and the app silently stops being installable. Same for
   * `/robots.txt` and `/sitemap.xml`, which crawlers request anonymously.
   */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|webmanifest|txt|xml)$).*)',
  ],
}
