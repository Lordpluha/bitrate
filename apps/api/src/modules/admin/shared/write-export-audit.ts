import type { PrismaService } from '@infra/prisma/prisma.service'
import type { Prisma } from '@prisma/client'
import type { AuditContextValue } from './decorators/audit-context.decorator'

/** Input for {@link writeExportAudit}. */
type WriteExportAuditInput = {
  prisma: Pick<PrismaService, 'auditLog'>
  /** Audit namespace, e.g. `admin-users` — the action is `<resource>.export`. */
  resource: string
  staffId: string
  /** The list filters and sort the export ran with; undefined keys are dropped. */
  filters: Record<string, string | number | boolean | undefined>
  rowCount: number
  truncated: boolean
  auditContext?: AuditContextValue
}

/**
 * Writes the single audit row for one CSV export. A GET is not audited by `AuditInterceptor`,
 * but an export hands personal data out of the panel, so it records who exported what: the
 * filter summary, how many rows the file holds and whether the 50 000-row cap cut it short.
 * `rowCount` is the match count read when the export started.
 */
export async function writeExportAudit({
  prisma,
  resource,
  staffId,
  filters,
  rowCount,
  truncated,
  auditContext = {},
}: WriteExportAuditInput): Promise<void> {
  const metadata: Prisma.InputJsonObject = {
    filters: Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined)),
    rowCount,
    truncated,
    ...(auditContext.requestId ? { requestId: auditContext.requestId } : {}),
  }

  await prisma.auditLog.create({
    data: {
      staffId,
      action: `${resource}.export`,
      entityType: resource,
      entityId: null,
      ipAddress: auditContext.ipAddress ?? null,
      metadata,
    },
  })
}
