import { MODERATION_ENTITY_TYPES } from '@modules/moderation'
import { ApiProperty } from '@nestjs/swagger'

/** One entity type's daily filed-report counts across the window. */
export class AdminOverviewReportsByTypeSeriesEntity {
  /** The kind of entity the reports were filed against. */
  @ApiProperty({ enum: MODERATION_ENTITY_TYPES })
  entityType: (typeof MODERATION_ENTITY_TYPES)[number]

  /** Reports filed per day, aligned by index to the response's `dates`. */
  @ApiProperty({ type: [Number] })
  counts: number[]

  /** The sum of `counts` — reports of this entity type filed in the window. */
  @ApiProperty()
  total: number
}

/**
 * Moderation reports filed per UTC calendar day, broken down by the entity type they were filed
 * against, over a trailing window. Counts every report *created* in the window regardless of its
 * current status. Every entity type is present, zero-filled, even with no reports.
 */
export class AdminOverviewReportsByTypeEntity {
  /** The oldest day in the window, inclusive, as `YYYY-MM-DD`. */
  @ApiProperty()
  from: string

  /** The newest (today, UTC) day in the window, inclusive, as `YYYY-MM-DD`. */
  @ApiProperty()
  to: string

  /** How many calendar days the window covers — equal to `dates.length`. */
  @ApiProperty()
  days: number

  /** Every UTC day in the window, oldest first, as `YYYY-MM-DD`. */
  @ApiProperty({ type: [String] })
  dates: string[]

  /** One series per moderation entity type, in `MODERATION_ENTITY_TYPES` order. */
  @ApiProperty({ type: [AdminOverviewReportsByTypeSeriesEntity] })
  series: AdminOverviewReportsByTypeSeriesEntity[]

  /** Reports filed in the window, across every entity type. */
  @ApiProperty()
  total: number
}
