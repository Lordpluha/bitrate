import type { Request } from 'express'
import { FALLBACK_LOCALE, type SupportedLocale, toSupportedLocale } from './supported-locales'

/**
 * Resolves the response locale for one request, independent of whether nestjs-i18n's own
 * resolver chain has run yet — the global exception filter can fire before routing (a 404 on
 * an unmatched path never reaches a controller), so translation cannot depend on
 * `I18nContext.current()` having been populated.
 *
 * Order: `Accept-Language` header, then a `?lang=` query param, then {@link FALLBACK_LOCALE}.
 */
export function resolveRequestLocale(request: Request | undefined): SupportedLocale {
  const header = request?.headers?.['accept-language']
  const headerValue = Array.isArray(header) ? header[0] : header
  if (headerValue) return toSupportedLocale(headerValue)

  const queryLang = request?.query?.lang
  if (typeof queryLang === 'string') return toSupportedLocale(queryLang)

  return FALLBACK_LOCALE
}
