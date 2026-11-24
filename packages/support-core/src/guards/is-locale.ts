import { type Locale, SUPPORTED_LOCALES } from '../domain.js'

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value)
}
