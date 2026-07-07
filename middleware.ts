import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_EXEMPT_PATHS = [
  '/api',
  '/_next',
  '/static',
  '/favicon.ico',
  '/robots.txt',
  '/auth',
  '/login',
  '/registration',
  '/forgot-password',
]

function isExempt(pathname: string) {
  for (const p of AUTH_EXEMPT_PATHS) {
    if (pathname === p) return true
    if (p.endsWith('/') && pathname.startsWith(p)) return true
    if (pathname.startsWith(p)) return true
  }
  if (pathname.match(/\.(png|jpg|jpeg|svg|css|js|map|ico|webmanifest)$/)) return true
  return false
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (isExempt(pathname)) return NextResponse.next()

  const refreshCookieName = process.env.REFRESH_TOKEN_NAME || 'refresh_token'
  const hasRefresh = Boolean(req.cookies.get(refreshCookieName)?.value)

  if (!hasRefresh) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}
