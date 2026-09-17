import type { ApiPaths, ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'
import { contractEnum } from '../http/contract-union'

/** The union as the API declares it. The domain declares its own; the mapper joins them. */
export type WireModerationStatus = ApiSchemas['AdminModerationReportEntity']['status']

/** See `WireArtistSortField` — read from the operation, not an entity field. */
export type WireModerationSortField = NonNullable<
  ApiPaths['/api/v1/admin/moderation/reports']['get']['parameters']['query']
>['sort']

const moderationStatusDto = contractEnum<WireModerationStatus>()([
  'OPEN',
  'REVIEWING',
  'RESOLVED',
  'REJECTED',
])

type ContractReport = Pick<
  ApiSchemas['AdminModerationReportEntity'],
  | 'id'
  | 'reporterId'
  | 'entityType'
  | 'entityId'
  | 'reason'
  | 'details'
  | 'status'
  | 'resolvedAt'
  | 'createdAt'
>

export const reportDto = z.object({
  id: z.uuid(),
  reporterId: z.uuid(),
  entityType: z.string(),
  entityId: z.uuid(),
  reason: z.string(),
  details: z.string().nullable(),
  status: moderationStatusDto,
  resolvedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
}) satisfies z.ZodType<ContractReport>

export type ReportDto = z.infer<typeof reportDto>

type ContractReportPage = Omit<ApiSchemas['PaginatedReportsEntity'], 'data'> & {
  data: ContractReport[]
}

export const reportPageDto = z.object({
  data: z.array(reportDto),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
}) satisfies z.ZodType<ContractReportPage>
