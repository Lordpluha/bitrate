/** A single day's `date_trunc('day', …)::date` bucket, as Postgres returns it via `$queryRaw`. */
type DayBucket = { day: Date }

/** One day of `Track` creation, broken down by current processing outcome. */
export type UploadsDayRow = DayBucket & {
  uploaded: number
  ready: number
  failed: number
  stuck: number
}

/** One day of a plain per-day count — shared shape for signups/listens/reports raw rows. */
export type DayCountRow = DayBucket & { count: number }

/** One day of filed reports for one entity type, as Postgres returns it via `$queryRaw`. */
export type DayEntityTypeRow = DayBucket & { entityType: string; count: number }

/** A series window: its UTC calendar days, oldest first, and the instant the oldest one starts. */
export type SeriesWindow = { dates: string[]; oldestDate: string; since: Date }

/** One entry of a zero-filled series keyed only by day. */
type SeriesPoint<T> = { date: string } & T

/**
 * Formats a `date_trunc('day', …)::date` value as `YYYY-MM-DD`. Postgres returns a bare `date`
 * (no time-of-day, no offset) as a JS `Date` at UTC midnight, so slicing the ISO string is exact
 * — no timezone math needed on the way back out.
 */
export function toDateKey(day: Date): string {
  return day.toISOString().slice(0, 10)
}

/**
 * The UTC calendar-day sequence a series window covers, oldest first, `days` entries long,
 * ending on `endUtcMidnight` (which callers pass as today at UTC midnight).
 */
function buildDateSequence(endUtcMidnight: Date, days: number): string[] {
  const start = new Date(endUtcMidnight)
  start.setUTCDate(start.getUTCDate() - (days - 1))

  return Array.from({ length: days }, (_, offset) => {
    const day = new Date(start)
    day.setUTCDate(day.getUTCDate() + offset)
    return toDateKey(day)
  })
}

/** The trailing window of `days` UTC calendar days ending today (UTC). */
export function resolveWindow(now: Date, days: number): SeriesWindow {
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const dates = buildDateSequence(todayUtc, days)
  // `days` is zod-bound to >= 1 before this is ever called, so `dates` is never empty — the
  // fallback below is unreachable, just satisfying `noUncheckedIndexedAccess`.
  const oldestDate = dates[0] ?? toDateKey(todayUtc)
  return { dates, oldestDate, since: new Date(`${oldestDate}T00:00:00.000Z`) }
}

/** Zero-fills a per-day count series (signups/listens/reports) across every day in the window. */
export function zeroFillCounts(
  rows: readonly DayCountRow[],
  dates: readonly string[],
): SeriesPoint<{ count: number }>[] {
  const byDate = new Map(rows.map((row) => [toDateKey(row.day), row.count]))
  return dates.map((date) => ({ date, count: byDate.get(date) ?? 0 }))
}

/** Zero-fills the per-day upload outcomes across every day in the window. */
export function zeroFillUploads(
  rows: readonly UploadsDayRow[],
  dates: readonly string[],
): SeriesPoint<Omit<UploadsDayRow, 'day'>>[] {
  const byDate = new Map(rows.map((row) => [toDateKey(row.day), row]))
  return dates.map((date) => {
    const row = byDate.get(date)
    return {
      date,
      uploaded: row?.uploaded ?? 0,
      ready: row?.ready ?? 0,
      failed: row?.failed ?? 0,
      stuck: row?.stuck ?? 0,
    }
  })
}

/** Zero-fills listener and artist signups side by side, one entry per day in the window. */
export function zeroFillSignups(
  listenerRows: readonly DayCountRow[],
  artistRows: readonly DayCountRow[],
  dates: readonly string[],
): SeriesPoint<{ listeners: number; artists: number }>[] {
  const listenersByDate = new Map(listenerRows.map((row) => [toDateKey(row.day), row.count]))
  const artistsByDate = new Map(artistRows.map((row) => [toDateKey(row.day), row.count]))
  return dates.map((date) => ({
    date,
    listeners: listenersByDate.get(date) ?? 0,
    artists: artistsByDate.get(date) ?? 0,
  }))
}
