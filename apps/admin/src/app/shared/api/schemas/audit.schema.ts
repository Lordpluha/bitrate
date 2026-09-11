import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

type ContractAuditEntry = Pick<
  ApiSchemas['AdminAuditLogEntity'],
  'id' | 'action' | 'entityType' | 'entityId' | 'actorUsername' | 'ipAddress' | 'createdAt'
>

/** Not exported: consumers need the inferred type and the page envelope, not this. */
const auditEntrySchema = z.object({
  id: z.uuid(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.uuid().nullable(),
  /** Resolved server-side so the list does not have to issue a request per row. */
  actorUsername: z.string().nullable(),
  ipAddress: z.string().nullable(),
  createdAt: z.iso.datetime(),
}) satisfies z.ZodType<ContractAuditEntry>

export type AuditEntry = z.infer<typeof auditEntrySchema>

type ContractAuditPage = Omit<ApiSchemas['PaginatedAdminAuditLogsEntity'], 'data'> & {
  data: ContractAuditEntry[]
}

export const auditEntryPageSchema = z.object({
  data: z.array(auditEntrySchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
}) satisfies z.ZodType<ContractAuditPage>
