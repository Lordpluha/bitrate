import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/** The trailing window, in days, `GET /admin/overview/series` covers when `days` is omitted. */
export const DEFAULT_OVERVIEW_SERIES_DAYS = 30

/** The largest window an operator may request in one call — bounds the raw-SQL aggregation. */
export const MAX_OVERVIEW_SERIES_DAYS = 365

export const GetOverviewSeriesQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(MAX_OVERVIEW_SERIES_DAYS).optional(),
})

export class GetOverviewSeriesQueryDto extends createZodDto(GetOverviewSeriesQuerySchema) {}
