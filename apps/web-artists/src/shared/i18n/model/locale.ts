export const supportedLocales = ['en', 'uk', 'pl'] as const

export type Locale = (typeof supportedLocales)[number]

export type TranslationValues = Record<string, number | string>

/** The cookie the language picker writes; the server reads it to render the first paint. */
export const LOCALE_COOKIE = 'bitrate-artist-locale'

/** The raw locale cookie value from a `document.cookie` string, if it is set. */
export const readLocaleCookie = (cookies: string): string | undefined =>
  cookies
    .split(';')
    .map((cookie) => cookie.trim().split('='))
    .find(([name]) => name === LOCALE_COOKIE)?.[1]

/** Each language is named in itself, so an artist can find theirs from any locale. */
export const localeLabels: ReadonlyArray<{ label: string; value: Locale }> = [
  { label: 'English', value: 'en' },
  { label: 'Українська', value: 'uk' },
  { label: 'Polski', value: 'pl' },
]

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' &&
  supportedLocales.some((locale) => locale === value)

/** Supported base languages of an Accept-Language header, most preferred first. */
const browserLocales = (header: string): Locale[] =>
  header
    .split(',')
    .map((part, index) => {
      const [tag = '', ...params] = part.trim().split(';')
      const quality = params.find((param) => param.trim().startsWith('q='))
      return {
        base: tag.split('-')[0]?.toLowerCase(),
        index,
        q: quality ? Number(quality.trim().slice(2)) : 1,
      }
    })
    .sort((a, b) => b.q - a.q || a.index - b.index)
    .map(({ base }) => base)
    .filter(isLocale)

type ResolveLocaleInput = {
  cookie?: string
  acceptLanguage?: string
}

/** The artist's saved choice, else their browser's best supported language, else English. */
export const resolveLocale = ({
  cookie,
  acceptLanguage,
}: ResolveLocaleInput): Locale => {
  if (isLocale(cookie)) return cookie
  return browserLocales(acceptLanguage ?? '')[0] ?? 'en'
}

/**
 * The workspace language in the browser, for code outside React such as API requests. The
 * provider keeps `<html lang>` on the active language, so a switch applies at once; before it
 * is set, the saved cookie or the browser's languages decide.
 */
export const clientLocale = (): Locale => {
  if (typeof document === 'undefined') return 'en'
  const shown = document.documentElement.lang
  if (isLocale(shown)) return shown
  return resolveLocale({
    cookie: readLocaleCookie(document.cookie),
    acceptLanguage: navigator.languages.join(','),
  })
}
