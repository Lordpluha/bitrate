import type { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http'
import { HttpClient } from '@angular/common/http'
import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { catchError, Observable, switchMap, throwError } from 'rxjs'
import { API_BASE_URL } from './api.config'

/** Endpoints that must never trigger a refresh — a 401 from them IS the answer. */
const NO_REFRESH = ['/admin/auth/login', '/admin/auth/refresh', '/admin/auth/logout']

/** See `auth.guard.ts` — true only in the development configuration, dropped from a production build. */
declare const NG_APP_AUTH_BYPASS: boolean

/**
 * Mirrors the refresh middleware the artists portal runs: on a 401, try the refresh endpoint
 * once, then replay the original request. Tokens are httpOnly cookies, so nothing is read or
 * written here — `withCredentials` is what carries them.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authed = req.clone({ withCredentials: true })

  if (NO_REFRESH.some((path) => authed.url.includes(path))) return next(authed)

  const http = inject(HttpClient)
  const router = inject(Router)

  return next(authed).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) return throwError(() => error)

      return http
        .post(`${API_BASE_URL}/api/v1/admin/auth/refresh`, {}, { withCredentials: true })
        .pipe(
          switchMap(() => next(authed)),
          catchError((refreshError: unknown) => {
            /**
             * Without this the bypass would only get you past the guard: the first API call
             * still 401s, the refresh still fails, and the redirect would bounce you to the
             * login screen the bypass exists to skip.
             */
            const bypassing = typeof NG_APP_AUTH_BYPASS !== 'undefined' && NG_APP_AUTH_BYPASS
            if (!bypassing) void router.navigate(['/login'])
            return throwError(() => refreshError)
          }),
        ) as Observable<never>
    }),
  )
}
