const DAY_MS = 86_400_000

/** How far back the default window starts, so overdue steps stay visible. */
export const CALENDAR_LOOKBACK_DAYS = 7
/** The default window covers a whole plan (−28 … +28 days) with room either side. */
export const CALENDAR_DEFAULT_DAYS = 63
/** The longest window one request may ask for. */
export const CALENDAR_MAX_DAYS = 120

/** The `[from, to)` window of a calendar request; missing ends come from the defaults. */
export function calendarWindow(
  query: { from?: Date; to?: Date },
  now = new Date(),
): { from: Date; to: Date } {
  const from = query.from ?? new Date(now.getTime() - CALENDAR_LOOKBACK_DAYS * DAY_MS)
  const to = query.to ?? new Date(from.getTime() + CALENDAR_DEFAULT_DAYS * DAY_MS)
  return { from, to }
}

/** True when the window is non-empty and no longer than `CALENDAR_MAX_DAYS`. */
export const isValidCalendarWindow = ({ from, to }: { from: Date; to: Date }) =>
  to > from && to.getTime() - from.getTime() <= CALENDAR_MAX_DAYS * DAY_MS
