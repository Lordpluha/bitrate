import { OVERVIEW_SERIES_RANGE_DAYS, type OverviewSeriesRangeDays } from '@domain/overview'
import { coveringTuple } from '@domain/shared'
import { createQueryCodec, enumParam, type ParamCodec, type QueryCodec } from '@presentation/state'

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

/** The bento's tiles; each opens its analysis panel over the page. */
export type OverviewPanel =
  'action' | 'listeners' | 'artists' | 'listens' | 'pipeline' | 'reports' | 'accounts' | 'audit'

const OVERVIEW_PANELS = coveringTuple<OverviewPanel>()([
  'action',
  'listeners',
  'artists',
  'listens',
  'pipeline',
  'reports',
  'accounts',
  'audit',
])

export type OverviewQuery = {
  days: OverviewSeriesRangeDays
  /** The open analysis panel, in the URL so a panel can be linked and Back closes it. */
  panel: OverviewPanel | null
}

/** `days` defaults to 30 and `panel` to none; both are omitted from a clean URL. */
export const overviewQueryCodec: QueryCodec<OverviewQuery> = createQueryCodec<OverviewQuery>({
  defaults: { days: DEFAULT_RANGE, panel: null },
  fields: {
    days: { param: 'days', codec: rangeDaysParam() },
    panel: { param: 'panel', codec: enumParam({ members: OVERVIEW_PANELS, default: null }) },
  },
})
