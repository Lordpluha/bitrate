import type { Overview } from './overview'

/** Read-only by design: the dashboard is a summary, never a place to act from directly. */
export abstract class OverviewRepository {
  abstract get(): Promise<Overview>
}
