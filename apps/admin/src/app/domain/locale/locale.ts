/**
 * The operator's chosen interface language — English (default) or Ukrainian — and the storage
 * key both `LocaleStore` (`presentation/navigation/locale-store.ts`) and the locale interceptor
 * (`infrastructure/http/locale.interceptor.ts`) read it from.
 *
 * This lives in `domain/` rather than `presentation/` because `infrastructure/` may not import
 * `presentation/` — the interceptor still needs the persisted value to set `Accept-Language` on
 * every request, without pulling in Angular DI or the signal store. `readPersistedLocale` is a
 * plain function using the global `localStorage`, exactly like `TrackProcessingStatus` and
 * `Permission` are written out here instead of imported from the contract: a value both layers
 * need, expressed once, with nothing transport- or framework-shaped attached.
 */

export const LOCALES = ['en', 'uk'] as const

export type AppLocale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = 'en'

/** Read by `LocaleStore` on boot and by the locale interceptor on every request. */
export const LOCALE_STORAGE_KEY = 'bitrate.admin.locale'

/** BCP-47 tag for `Accept-Language` and locale-aware `Intl`/`DatePipe` formatting. */
export const INTL_LOCALE_TAG: Record<AppLocale, string> = {
  en: 'en-US',
  uk: 'uk-UA',
}

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return LOCALES.includes(value as AppLocale)
}

/**
 * Reads the persisted locale straight from storage, with no Angular DI — the one entry point
 * `infrastructure/http/locale.interceptor.ts` is allowed to use.
 *
 * Wrapped in try/catch for the same reason `ThemeStore`'s reader is: a private window, cleared
 * site data, or storage blocked by the browser all throw on access rather than returning `null`,
 * and a language preference is never worth failing a request over.
 */
export function readPersistedLocale(): AppLocale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    return isAppLocale(stored) ? stored : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}
