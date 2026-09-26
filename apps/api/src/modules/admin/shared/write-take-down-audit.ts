import type { Prisma } from '@prisma/client'

/** Input for {@link writeTakeDownAudit}. */
type WriteTakeDownAuditInput = {
  tx: Prisma.TransactionClient
  entityType: string
  entityId: string
  action: string
  staffId: string
  reason?: string
  before: Prisma.InputJsonObject
  after: Prisma.InputJsonObject
  requestId?: string
  ipAddress?: string
}

/**
 * Writes a detailed audit row for a destructive/restorative operator action, in the same
 * transaction as the mutation it records. Complements — does not replace — the generic row
 * `AuditInterceptor` writes for every state-changing request: this one carries the operator's
 * stated `reason` and the before/after state the interceptor has no way to know.
 *
 * `requestId`/`ipAddress` mirror what `AuditInterceptor` records for the same request — same
 * correlation id in `metadata.requestId`, same `ipAddress` column — so the two rows for one
 * mutation can be joined. Callers pass them through `AuditContext()`.
 *
 * `before`/`after` are typed `Prisma.InputJsonObject`, not `Record<string, unknown>` — a
 * caller with a `Date` field must serialise it with `.toISOString()` before calling, so
 * `metadata` below is already JSON-safe and needs no `as` cast to reach Prisma's `Json` column.
 */
export async function writeTakeDownAudit({
  tx,
  entityType,
  entityId,
  action,
  staffId,
  reason,
  before,
  after,
  requestId,
  ipAddress,
}: WriteTakeDownAuditInput): Promise<void> {
  const metadata: Prisma.InputJsonObject = {
    reason: reason ?? null,
    before,
    after,
    ...(requestId ? { requestId } : {}),
  }

  await tx.auditLog.create({
    data: {
      staffId,
      action,
      entityType,
      entityId,
      ipAddress: ipAddress ?? null,
      metadata,
    },
  })
}
