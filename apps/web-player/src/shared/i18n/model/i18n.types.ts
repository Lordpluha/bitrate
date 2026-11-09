const supportedLocales = ['en', 'uk', 'pl'] as const

export type Locale = (typeof supportedLocales)[number]

export type TranslationValues = Record<string, number | string>

export const localeLabels: ReadonlyArray<{
  label: string
  value: Locale
}> = [
  { label: 'English', value: 'en' },
  { label: 'Українська', value: 'uk' },
  { label: 'Polski', value: 'pl' },
]

const legacyLocales: Record<string, Locale> = {
  'English (English)': 'en',
  'Українська (Ukrainian)': 'uk',
}

export const normalizeLocale = (value: unknown): Locale => {
  if (typeof value !== 'string') return 'en'
  if (supportedLocales.includes(value as Locale)) return value as Locale

  return legacyLocales[value] ?? 'en'
}

/**
 * The first supported locale among the browser's preferred languages (`navigator.languages`),
 * matched by the language subtag so `uk-UA` and `pl-PL` count. Null when none is supported.
 */
export const pickSupportedLocale = (
  languages: ReadonlyArray<string>,
): Locale | null => {
  for (const language of languages) {
    const base = language.toLowerCase().split('-')[0]
    if (supportedLocales.includes(base as Locale)) return base as Locale
  }

  return null
}
