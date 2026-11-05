import { useI18n } from '@shared/i18n'

/** Numbers and short UTC days in the workspace language. */
export function useFormats() {
  const { locale } = useI18n()
  const number = new Intl.NumberFormat(locale)
  const ratio = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 })
  const day = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
  return {
    number: (value: number) => number.format(value),
    ratio: (value: number) => ratio.format(value),
    day: (date: string) => day.format(new Date(date)),
  }
}
