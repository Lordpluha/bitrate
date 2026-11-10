import type { Locale } from '@shared/i18n'
import { z } from 'zod'

const count = z.number().int().nonnegative()
const platformStatsSchema = z.object({
  artists: count,
  listeners: count,
  tracks: count,
})

/** Public platform totals from `GET /api/v1/platform/stats`. */
export type PlatformStats = z.infer<typeof platformStatsSchema>

/** The API's totals, or `null` when the answer is not three whole counts (the landing then hides them). */
export const parsePlatformStats = (value: unknown): PlatformStats | null => {
  const parsed = platformStatsSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

/** Counts below this are written in full; above it they are shortened (12.4K). */
const COMPACT_FROM = 10_000

/** A total as the landing writes it in its language. */
export const formatStat = ({
  value,
  locale,
}: {
  value: number
  locale: Locale
}) =>
  new Intl.NumberFormat(
    locale,
    value < COMPACT_FROM
      ? undefined
      : { notation: 'compact', maximumFractionDigits: 1 },
  ).format(value)

/**
 * The smallest totals the landing shows. Below them the numbers read as an empty catalogue and
 * argue against signing up, so the hero leaves them out until the platform has grown into them.
 */
const SHOW_FROM = { tracks: 1000, artists: 100, listeners: 1000 } as const

/** Whether the totals are large enough to help, not hurt, the hero. */
export const worthShowing = (stats: PlatformStats) =>
  stats.tracks >= SHOW_FROM.tracks &&
  stats.artists >= SHOW_FROM.artists &&
  stats.listeners >= SHOW_FROM.listeners
