import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'
import { contractEnum } from './contract-union'

export type ModerationStatus = ApiSchemas['AdminModerationReportEntity']['status']

/** Not exported: only the inferred type is part of this module surface. */
const moderationStatusSchema = contractEnum<ModerationStatus>()([
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

export const moderationReportSchema = z.object({
  id: z.uuid(),
  reporterId: z.uuid(),
  entityType: z.string(),
  entityId: z.uuid(),
  reason: z.string(),
  details: z.string().nullable(),
  status: moderationStatusSchema,
  resolvedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
}) satisfies z.ZodType<ContractReport>

export type ModerationReport = z.infer<typeof moderationReportSchema>

type ContractReportPage = Omit<ApiSchemas['PaginatedReportsEntity'], 'data'> & {
  data: ContractReport[]
}

export const moderationReportPageSchema = z.object({
  data: z.array(moderationReportSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
}) satisfies z.ZodType<ContractReportPage>

export type ModerationReportPage = z.infer<typeof moderationReportPageSchema>
