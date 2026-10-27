import type { Locale } from '@/shared/i18n'

type FormatNumberInput = {
  locale: Locale
  options?: Intl.NumberFormatOptions
  value: number
}

/** A number with the app locale's grouping: 12,345 in English, 12 345 in Ukrainian. */
export const formatNumber = ({ locale, options, value }: FormatNumberInput) =>
  new Intl.NumberFormat(locale, options).format(value)
