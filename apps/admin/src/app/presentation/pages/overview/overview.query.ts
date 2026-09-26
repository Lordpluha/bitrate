import { OVERVIEW_SERIES_RANGE_DAYS, type OverviewSeriesRangeDays } from '@domain/overview'
import { createQueryCodec, type ParamCodec, type QueryCodec } from '@presentation/state'

const DEFAULT_RANGE: OverviewSeriesRangeDays = 30

/**
 * A closed choice of 7/30/90 days, not `intParam`: any positive integer would otherwise reach
 * the series endpoint, and the chart range control only ever offers these three.
 */
function rangeDaysParam(): ParamCodec<OverviewSeriesRangeDays> {
  return {
    decode: (raw) => {
      if (raw === null) return DEFAULT_RANGE
      const parsed = Number.parseInt(raw, 10)
      return (OVERVIEW_SERIES_RANGE_DAYS as readonly number[]).includes(parsed)
        ? (parsed as OverviewSeriesRangeDays)
        : DEFAULT_RANGE
    },
    encode: (value) => (value === DEFAULT_RANGE ? null : String(value)),
  }
}

export type OverviewQuery = {
  days: OverviewSeriesRangeDays
}

/** `days` defaults to 30 and is omitted from a clean URL, same convention as every list screen. */
export const overviewQueryCodec: QueryCodec<OverviewQuery> = createQueryCodec<OverviewQuery>({
  defaults: { days: DEFAULT_RANGE },
  fields: {
    days: { param: 'days', codec: rangeDaysParam() },
  },
})
