import type { Locale } from '@shared/i18n'
import { en, type LandingCatalog, type LandingKey } from './messages/en'
import { pl } from './messages/pl'
import { uk } from './messages/uk'

/** Values interpolated into `{name}` placeholders. */
type LandingCopyValues = Record<string, number | string>
export type LandingCopy = (
  key: LandingKey,
  values?: LandingCopyValues,
) => string

/* The landing ships en, uk and pl; every other app locale (de, ru) reads the English copy. */
const catalogs: Partial<Record<Locale, LandingCatalog>> = { uk, pl }

const interpolate = (message: string, values?: LandingCopyValues) =>
  values
    ? message.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
        values[name] === undefined ? placeholder : String(values[name]),
      )
    : message

/** Copy lookup for a locale: its catalog first, then English for anything it leaves out. */
export const pickLandingCopy = (locale: Locale): LandingCopy => {
  const catalog = catalogs[locale] ?? {}
  return (key, values) => interpolate(catalog[key] ?? en[key], values)
}
