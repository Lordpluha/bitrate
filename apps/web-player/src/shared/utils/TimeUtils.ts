import type { Translate } from '@/shared/i18n'

type FormatTotalDurationInput = {
  /** Length in seconds. */
  duration: number
  t: Translate
}

/** A collection's total length in the app locale: "1 hr 5 min" or "42 min". */
export const formatTotalDuration = ({
  duration,
  t,
}: FormatTotalDurationInput) => {
  const minutes = Math.floor(duration / 60)
  const hours = Math.floor(minutes / 60)

  return hours > 0
    ? t('common.durationHours', { hours, minutes: minutes % 60 })
    : t('common.durationMinutes', { minutes })
}
