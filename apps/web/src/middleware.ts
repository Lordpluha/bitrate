import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { ROUTES } from '@shared/routes'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get('access_token')?.value
  console.log('Middleware - pathname:', pathname, 'token:', !!token)

  // Определяем auth маршруты (недоступны с токеном)
  const authRoutes = [ROUTES.auth.login, ROUTES.auth.registration]

  // Определяем публичные маршруты (доступны без токена)
  const publicRoutes = [...authRoutes, ROUTES.landing]

  const isPublicRoute = publicRoutes.some(route => pathname === route)
  const isAuthRoute = authRoutes.some(route => pathname === route)

  console.log('isPublicRoute:', isPublicRoute, 'isAuthRoute:', isAuthRoute)

  // Если пользователь НЕ авторизован
  if (!token) {
    // Если пытается попасть на защищенную страницу (включая /main) - редиректим на логин
    if (!isPublicRoute) {
      console.log(
        'Redirecting to login - no token, trying to access protected route:',
        pathname
      )
      return NextResponse.redirect(new URL(ROUTES.auth.login, request.url))
    }
    // Если на публичной странице - пропускаем
    console.log('Allowing access to public route:', pathname)
    return NextResponse.next()
  }

  // Если пользователь авторизован
  if (token) {
    // Если находится на auth страницах - редиректим на главную
    if (isAuthRoute) {
      console.log(
        'Redirecting to main - user authenticated, on auth route:',
        pathname
      )
      return NextResponse.redirect(new URL(ROUTES.main, request.url))
    }
    // Если авторизован и на любой другой странице - пропускаем
    console.log('Allowing access to protected route:', pathname)
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)'
  ]
}
