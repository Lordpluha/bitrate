import type { ApiSchemas } from '@bitrate/contracts'
import * as z from 'zod'

type ContractSeries = ApiSchemas['AdminOverviewReportsByTypeSeriesEntity']

const overviewReportsByTypeSeriesDto = z.object({
  entityType: z.enum(['track', 'album', 'playlist', 'artist', 'podcast', 'episode', 'user']),
  counts: z.array(z.number().int()),
  total: z.number().int(),
}) satisfies z.ZodType<ContractSeries>

type ContractReportsByType = ApiSchemas['AdminOverviewReportsByTypeEntity']

export const overviewReportsByTypeDto = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
  days: z.number().int(),
  dates: z.array(z.iso.date()),
  series: z.array(overviewReportsByTypeSeriesDto),
  total: z.number().int(),
}) satisfies z.ZodType<ContractReportsByType>

export type OverviewReportsByTypeDto = z.infer<typeof overviewReportsByTypeDto>
