const dateTimeUtc = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})

/** Medium date and short time in UTC; callers add the UTC label where they show it. */
export function formatDateTimeUtc(instant: string): string {
  return dateTimeUtc.format(new Date(instant))
}
