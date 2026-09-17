import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'
import { auditEntryDto } from '../audit/audit.dto'

type ContractOverviewReports = ApiSchemas['AdminOverviewReportsEntity']

const overviewReportsDto = z.object({
  open: z.number().int(),
  reviewing: z.number().int(),
}) satisfies z.ZodType<ContractOverviewReports>

type ContractOverviewTracks = ApiSchemas['AdminOverviewTracksEntity']

const overviewTracksDto = z.object({
  processing: z.number().int(),
  ready: z.number().int(),
  failed: z.number().int(),
  stuck: z.number().int(),
  stuckAfterMs: z.number().int(),
}) satisfies z.ZodType<ContractOverviewTracks>

type ContractOverviewDeactivated = ApiSchemas['AdminOverviewDeactivatedEntity']

const overviewDeactivatedDto = z.object({
  users: z.number().int(),
  artists: z.number().int(),
}) satisfies z.ZodType<ContractOverviewDeactivated>

type ContractOverviewLast7Days = ApiSchemas['AdminOverviewLast7DaysEntity']

const overviewLast7DaysDto = z.object({
  signups: z.number().int(),
  uploads: z.number().int(),
}) satisfies z.ZodType<ContractOverviewLast7Days>

/**
 * `recentActivity` reuses `auditEntryDto` from `infrastructure/audit/audit.dto.ts` rather than
 * declaring the row shape a second time — it is the same `AdminAuditLogEntity` the full audit
 * list already validates.
 */
type ContractOverview = Pick<
  ApiSchemas['AdminOverviewEntity'],
  'reports' | 'tracks' | 'deactivated' | 'last7Days' | 'recentActivity'
>

export const overviewDto = z.object({
  reports: overviewReportsDto,
  tracks: overviewTracksDto,
  deactivated: overviewDeactivatedDto,
  last7Days: overviewLast7DaysDto,
  recentActivity: z.array(auditEntryDto),
}) satisfies z.ZodType<ContractOverview>

export type OverviewDto = z.infer<typeof overviewDto>
