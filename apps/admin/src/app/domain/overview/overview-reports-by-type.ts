import type { ModerationEntityType } from '../moderation/report'

/** One entity type's daily filed-report counts, aligned by index to the report's `dates`. */
type OverviewReportsByTypeSeries = {
  entityType: ModerationEntityType
  counts: number[]
  total: number
}

/**
 * Moderation reports filed per UTC day over a trailing window, broken down by the entity type
 * they were filed against. Counts reports created in the window whatever their current status;
 * every entity type is present, zero-filled.
 */
export type OverviewReportsByType = {
  from: Date
  to: Date
  days: number
  dates: Date[]
  series: OverviewReportsByTypeSeries[]
  total: number
}
