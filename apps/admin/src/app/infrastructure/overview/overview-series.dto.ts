import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

type ContractUploadsPoint = ApiSchemas['AdminOverviewUploadsPointEntity']

const overviewUploadsPointDto = z.object({
  date: z.iso.date(),
  uploaded: z.number().int(),
  ready: z.number().int(),
  failed: z.number().int(),
  stuck: z.number().int(),
}) satisfies z.ZodType<ContractUploadsPoint>

type ContractSignupsPoint = ApiSchemas['AdminOverviewSignupsPointEntity']

const overviewSignupsPointDto = z.object({
  date: z.iso.date(),
  listeners: z.number().int(),
  artists: z.number().int(),
}) satisfies z.ZodType<ContractSignupsPoint>

type ContractListensPoint = ApiSchemas['AdminOverviewListensPointEntity']

const overviewListensPointDto = z.object({
  date: z.iso.date(),
  count: z.number().int(),
}) satisfies z.ZodType<ContractListensPoint>

type ContractReportsPoint = ApiSchemas['AdminOverviewReportsPointEntity']

const overviewReportsPointDto = z.object({
  date: z.iso.date(),
  count: z.number().int(),
}) satisfies z.ZodType<ContractReportsPoint>

type ContractReportsByStatus = ApiSchemas['AdminOverviewReportsByStatusEntity']

const overviewReportsByStatusDto = z.object({
  open: z.number().int(),
  reviewing: z.number().int(),
  resolved: z.number().int(),
  rejected: z.number().int(),
}) satisfies z.ZodType<ContractReportsByStatus>

type ContractOverviewSeries = ApiSchemas['AdminOverviewSeriesEntity']

export const overviewSeriesDto = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
  days: z.number().int(),
  uploads: z.array(overviewUploadsPointDto),
  signups: z.array(overviewSignupsPointDto),
  listens: z.array(overviewListensPointDto),
  reports: z.array(overviewReportsPointDto),
  reportsByStatus: overviewReportsByStatusDto,
}) satisfies z.ZodType<ContractOverviewSeries>

export type OverviewSeriesDto = z.infer<typeof overviewSeriesDto>
