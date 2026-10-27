import type { Locale } from '@/shared/i18n'

const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}

type FormatDateInput = {
  date: Date | number | string
  locale: Locale
  /** Defaults to "Oct 14, 2026" (short month, day and year). */
  options?: Intl.DateTimeFormatOptions
}

/** A date in the app locale, never the browser's. */
export const formatDate = ({
  date,
  locale,
  options = DEFAULT_DATE_OPTIONS,
}: FormatDateInput) =>
  new Intl.DateTimeFormat(locale, options).format(new Date(date))
