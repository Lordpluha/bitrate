import type { Locale } from './locales'
import { en, type Messages, type TranslationKey } from './messages/en'
import { pl } from './messages/pl'
import { uk } from './messages/uk'

const catalogs: Record<Locale, Messages> = { en, uk, pl }

type TranslationValues = Record<string, string | number>
export type Translate = (key: TranslationKey, values?: TranslationValues) => string

/** Fills `{placeholder}` slots; unknown placeholders stay visible so they are noticed. */
function interpolate(message: string, values?: TranslationValues): string {
  if (!values) return message
  return message.replace(/\{(\w+)\}/g, (slot, name: string) => {
    const value = values[name]
    return value === undefined ? slot : String(value)
  })
}

/** Builds the translator for one locale; a missing key falls back to English. */
export function createTranslator(locale: Locale): Translate {
  const messages = catalogs[locale]
  return (key, values) => interpolate(messages[key] ?? en[key], values)
}
