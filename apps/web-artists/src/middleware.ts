import { ROUTES } from '@shared/routes/routes'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Route prefixes that require an authenticated artist session.
 * Everything else — the landing page, the auth flows, static assets — is public.
 * The portal ships no authenticated area yet (see PRODUCT.md); add its prefix
 * here (e.g. '/dashboard') when one lands.
 */
const PROTECTED_PREFIXES: readonly string[] = []

/** True when `pathname` is the prefix itself or a path segment below it. */
function isUnder(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => isUnder(pathname, prefix))
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!isProtected(pathname)) return NextResponse.next()

  const refreshCookieName = process.env.REFRESH_TOKEN_NAME || 'refresh_token'
  const hasRefresh = Boolean(req.cookies.get(refreshCookieName)?.value)

  if (!hasRefresh) {
    const url = req.nextUrl.clone()
    url.pathname = ROUTES.auth.login
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
