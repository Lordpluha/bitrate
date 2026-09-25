import type { ApiPaths, ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

/** See `WireArtistSortField` — read from the operation, not an entity field. */
export type WireAuditSortField = NonNullable<
  ApiPaths['/api/v1/admin/audit']['get']['parameters']['query']
>['sort']

type ContractAuditEntry = Pick<
  ApiSchemas['AdminAuditLogEntity'],
  'id' | 'action' | 'entityType' | 'entityId' | 'actorUsername' | 'ipAddress' | 'createdAt'
>

/** Exported so `infrastructure/overview` can validate `recentActivity` rows without duplicating this shape. */
export const auditEntryDto = z.object({
  id: z.uuid(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.uuid().nullable(),
  /** Resolved server-side so the list does not have to issue a request per row. */
  actorUsername: z.string().nullable(),
  ipAddress: z.string().nullable(),
  createdAt: z.iso.datetime(),
}) satisfies z.ZodType<ContractAuditEntry>

export type AuditEntryDto = z.infer<typeof auditEntryDto>

type ContractAuditPage = Omit<ApiSchemas['PaginatedAdminAuditLogsEntity'], 'data'> & {
  data: ContractAuditEntry[]
}

export const auditEntryPageDto = z.object({
  data: z.array(auditEntryDto),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
}) satisfies z.ZodType<ContractAuditPage>
