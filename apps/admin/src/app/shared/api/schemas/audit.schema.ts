import { z } from 'zod'

/** Not exported: consumers need the inferred type and the page envelope, not this. */
const auditEntrySchema = z.object({
  id: z.uuid(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.uuid().nullable(),
  /** Resolved server-side so the list does not have to issue a request per row. */
  actorName: z.string().nullable(),
  ipAddress: z.string().nullable(),
  createdAt: z.iso.datetime(),
})

export type AuditEntry = z.infer<typeof auditEntrySchema>

export const auditEntryPageSchema = z.object({
  data: z.array(auditEntrySchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
})
