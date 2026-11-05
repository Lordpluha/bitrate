import {
  en,
  type Messages,
  type PluralBase,
  type TranslationKey,
} from '../messages/en'
import { pl } from '../messages/pl'
import { uk } from '../messages/uk'
import type { Locale, TranslationValues } from './locale'

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

/** The translator every component reads from `useI18n()`. */
export type I18n = {
  locale: Locale
  t: Translate
  /**
   * Translates a message that may be a catalog key — form schemas and server functions
   * return keys — and passes anything else, such as an API error, through unchanged.
   * Takes a form error's optional message as is; no message renders as nothing.
   */
  tMessage: (message: string | undefined) => string
  tp: TranslatePlural
}

/**
 * Marks a catalog key used as a message outside React — a form schema, a server function —
 * so the compiler checks it exists; the component renders it with `tMessage`.
 */
export const messageKey = (key: TranslationKey) => key

const isTranslationKey = (message: string): message is TranslationKey =>
  Object.hasOwn(en, message)

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

  const t: Translate = (key, values) =>
    interpolate(messages[key] ?? en[key], values)

  return {
    locale,
    t,
    tMessage: (message = '') =>
      isTranslationKey(message) ? t(message) : message,
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
