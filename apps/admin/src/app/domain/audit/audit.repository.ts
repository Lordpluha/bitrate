import type { Page, PageRequest } from '../shared/page'
import type { AuditEntry, AuditFilter } from './audit-entry'

export type ListAuditEntriesQuery = PageRequest & {
  filter: AuditFilter
}

/**
 * Read-only by design: an audit trail somebody can edit is not an audit trail, so this port
 * offers no way to write one.
 */
export abstract class AuditRepository {
  abstract list(query: ListAuditEntriesQuery): Promise<Page<AuditEntry>>
}
