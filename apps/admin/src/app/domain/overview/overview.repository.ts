import type { Overview } from './overview'
import type { OverviewSeries } from './overview-series'

/** Read-only by design: the dashboard is a summary, never a place to act from directly. */
export abstract class OverviewRepository {
  abstract get(): Promise<Overview>
  /** @param days Window size in UTC calendar days — the API defaults to 30, caps at 365. */
  abstract getSeries(days: number): Promise<OverviewSeries>
}
