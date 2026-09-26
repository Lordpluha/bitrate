/** Every locale the API translates error/validation messages into. English is the fallback. */
const SUPPORTED_LOCALES = ['en', 'uk'] as const

/** One of {@link SUPPORTED_LOCALES}. */
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

/** The locale used whenever a request specifies none, or specifies one we don't ship. */
export const FALLBACK_LOCALE: SupportedLocale = 'en'

/** Narrows an arbitrary language tag ("uk-UA", "de", …) to a {@link SupportedLocale}. */
export function toSupportedLocale(tag: string | undefined): SupportedLocale {
  const base = tag?.split(',')[0]?.trim().split('-')[0]?.toLowerCase()
  return (SUPPORTED_LOCALES as readonly string[]).includes(base ?? '')
    ? (base as SupportedLocale)
    : FALLBACK_LOCALE
}
