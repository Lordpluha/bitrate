import { ROUTES } from '@shared/routes'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const publicRoutes = [
  ROUTES.auth.login,
  ROUTES.auth.twoFactorLogin,
  ROUTES.auth.registration,
  ROUTES.auth.forgotPassword,
  ROUTES.auth.resetPassword(),
  ROUTES.auth.verifyEmail(),
  ROUTES.landing,
  '/login',
  '/login/2fa',
  '/offline',
] as const

export const isPublicRoute = (pathname: string) =>
  publicRoutes.some((route) => pathname === route)

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

  if (!hasRecoverableSession && !isPublicRoute(pathname)) {
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
   *
   * `monitoring` is Sentry's `tunnelRoute` from `next.config.ts`: the browser
   * posts events to it without a session, so guarding it answers the beacon
   * with a login redirect and every client-side error is lost in silence.
   */
  matcher: [
    '/((?!api|monitoring|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|webmanifest|txt|xml)$).*)',
  ],
}
