import { ROUTES } from '@shared/routes'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get('access_token')

  // Определяем auth маршруты (недоступны с токеном)
  const authRoutes = [ROUTES.auth.login, ROUTES.auth.registration]

  // Определяем публичные маршруты (доступны без токена)
  const publicRoutes = [...authRoutes, ROUTES.landing]

  const isPublicRoute = publicRoutes.some((route) => pathname === route)
  const isAuthRoute = authRoutes.some((route) => pathname === route)

  // Если пользователь НЕ авторизован
  if (!token) {
    // Если пытается попасть на защищенную страницу (включая /main) - редиректим на логин
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL(ROUTES.auth.login, request.url))
    }
    // Если на публичной странице - пропускаем
    return NextResponse.next()
  }

  // Если пользователь авторизован
  if (token) {
    // Если находится на auth страницах - редиректим на главную
    // ОТКЛЮЧЕНО: создает цикл редиректов когда токен истек
    // if (isAuthRoute) {
    //   return NextResponse.redirect(new URL(ROUTES.main, request.url))
    // }
    // Если авторизован и на любой другой странице - пропускаем
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
