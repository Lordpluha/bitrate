/**
 * Medium date and short time in UTC, in `locale` (US English unless the caller passes the
 * workspace language); callers add the UTC label where they show it.
 */
export function formatDateTimeUtc(instant: string, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(instant))
}
