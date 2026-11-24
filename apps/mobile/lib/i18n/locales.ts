/** The locales the web player ships; mobile mirrors them. */
const SUPPORTED_LOCALES = ['en', 'uk', 'pl'] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

const isLocale = (value: string): value is Locale => (SUPPORTED_LOCALES as readonly string[]).includes(value)

/** Maps a BCP 47 tag such as `uk-UA` to a supported locale, falling back to English. */
export function matchLocale(tag: string | undefined): Locale {
  const language = tag?.split('-')[0]?.toLowerCase() ?? ''
  return isLocale(language) ? language : 'en'
}

/** The device language as Hermes' Intl reports it. */
export function detectDeviceLocale(): Locale {
  return matchLocale(Intl.DateTimeFormat().resolvedOptions().locale)
}
