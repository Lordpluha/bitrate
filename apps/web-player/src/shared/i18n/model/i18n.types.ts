export const supportedLocales = ['en', 'uk', 'ru', 'pl', 'de'] as const

export type Locale = (typeof supportedLocales)[number]

export type TranslationValues = Record<string, number | string>

export const localeLabels: ReadonlyArray<{
  label: string
  value: Locale
}> = [
  { label: 'English', value: 'en' },
  { label: 'Українська', value: 'uk' },
  { label: 'Русский', value: 'ru' },
  { label: 'Polski', value: 'pl' },
  { label: 'Deutsch', value: 'de' },
]

const legacyLocales: Record<string, Locale> = {
  'English (English)': 'en',
  'Русский (Russian)': 'ru',
  'Українська (Ukrainian)': 'uk',
}

export const normalizeLocale = (value: unknown): Locale => {
  if (typeof value !== 'string') return 'en'
  if (supportedLocales.includes(value as Locale)) return value as Locale

  return legacyLocales[value] ?? 'en'
}
