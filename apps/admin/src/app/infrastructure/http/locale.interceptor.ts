import type { HttpInterceptorFn } from '@angular/common/http'
import { INTL_LOCALE_TAG, readPersistedLocale } from '@domain/locale'

/**
 * Sends the operator's chosen interface language as `Accept-Language` on every request, so the
 * API's i18n layer (validation/error messages, locale-aware mail) matches what the panel shows.
 *
 * Deliberately separate from `auth.interceptor.ts` — refresh-on-401 and locale tagging are two
 * unrelated concerns, and `infrastructure/` may not import `presentation/`'s `LocaleStore`, so
 * this reads the persisted value straight from storage via `readPersistedLocale` (see
 * `domain/locale/locale.ts`) rather than through the signal store.
 */
export const localeInterceptor: HttpInterceptorFn = (req, next) => {
  const tag = INTL_LOCALE_TAG[readPersistedLocale()]

  return next(req.clone({ setHeaders: { 'Accept-Language': tag } }))
}
