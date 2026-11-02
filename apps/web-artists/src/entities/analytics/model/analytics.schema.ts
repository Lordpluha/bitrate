import type { ApiSchemas } from '@bitrate/contracts'
import type { Translate } from '@shared/i18n'
import { z } from 'zod'

export const analyticsPeriods = [7, 28, 90] as const
export type AnalyticsPeriod = (typeof analyticsPeriods)[number]

const totals = z.object({
  plays: z.number().int().nonnegative(),
  listeners: z.number().int().nonnegative(),
})

export const artistAnalyticsSchema = z.object({
  state: z.enum(['NO_TRACKS', 'NO_DATA_YET', 'READY']),
  period: z.object({
    from: z.iso.datetime({ offset: true }),
    to: z.iso.datetime({ offset: true }),
    days: z.union([z.literal(7), z.literal(28), z.literal(90)]),
    timezone: z.literal('UTC'),
  }),
  freshness: z.iso.datetime({ offset: true }),
  totals: totals.nullable(),
  previous: totals.nullable(),
  daily: z.array(
    z.object({
      date: z.iso.date(),
      plays: z.number().int().nonnegative(),
    }),
  ),
  topTracks: z
    .array(
      z.object({
        trackId: z.uuid(),
        title: z.string(),
        plays: z.number().int().nonnegative(),
        listeners: z.number().int().nonnegative(),
      }),
    )
    .max(10),
  external: z.array(
    z.object({
      source: z.enum(['SPOTIFY', 'APPLE_MUSIC', 'YOUTUBE_MUSIC']),
      state: z.literal('NOT_CONNECTED'),
    }),
  ),
}) satisfies z.ZodType<ApiSchemas['ArtistAnalyticsEntity']>

export type ArtistAnalytics = z.infer<typeof artistAnalyticsSchema>

/** Change against the previous period as text; never a bare color. */
export function changeLabel(
  current: number,
  previous: number,
  t: Translate,
): string {
  if (previous === 0)
    return current === 0 ? t('analytics.noChange') : t('analytics.new')
  const change = Math.round(((current - previous) / previous) * 100)
  if (change === 0) return t('analytics.noChange')
  return t('analytics.change', {
    change: `${change > 0 ? '+' : '−'}${Math.abs(change)}`,
  })
}
