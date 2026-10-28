import {
  en,
  type Messages,
  type PluralBase,
  type TranslationKey,
} from '@/shared/i18n/messages/en'
import { pl } from '@/shared/i18n/messages/pl'
import { uk } from '@/shared/i18n/messages/uk'
import type { Locale, TranslationValues } from '@/shared/i18n/model/i18n.types'

const catalogs: Record<Locale, Messages> = { en, pl, uk }

/** Looks a key up in the active catalog and fills its `{placeholders}`. */
export type Translate = (
  key: TranslationKey,
  values?: TranslationValues,
) => string

type TranslatePluralInput = {
  count: number
  key: PluralBase
  values?: TranslationValues
}

/**
 * Picks the plural form of `key` for `count` (`.one`, `.few`, `.many`, `.other`) by the
 * locale's plural rules; `{count}` is filled with the count in the locale's digits.
 */
type TranslatePlural = (input: TranslatePluralInput) => string

/** The translator every client component reads from `useI18n()`. */
export type I18n = {
  locale: Locale
  t: Translate
  tp: TranslatePlural
}

const interpolate = (message: string, values?: TranslationValues) => {
  if (!values) return message

  return message.replace(/\{(\w+)\}/g, (placeholder, key: string) => {
    const value = values[key]
    return value === undefined ? placeholder : String(value)
  })
}

type CreateI18nInput = {
  locale: Locale
}

/** Builds the translator for one locale; missing keys fall back to English. */
export const createI18n = ({ locale }: CreateI18nInput): I18n => {
  const messages = catalogs[locale]
  const pluralRules = new Intl.PluralRules(locale)
  const numberFormat = new Intl.NumberFormat(locale)

  return {
    locale,
    t: (key, values) => interpolate(messages[key] ?? en[key], values),
    tp: ({ count, key, values }) => {
      const message =
        messages[`${key}.${pluralRules.select(count)}`] ??
        messages[`${key}.other`] ??
        en[`${key}.other`]

      return interpolate(message, {
        count: numberFormat.format(count),
        ...values,
      })
    },
  }
}
