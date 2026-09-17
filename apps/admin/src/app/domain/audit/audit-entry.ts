import type { Sort } from '../shared/sort'

/** One recorded operator action. Read-only everywhere — nothing in this panel writes one. */
export type AuditEntry = {
  id: string
  action: string
  entityType: string
  entityId: string | null
  /** Resolved server-side, so the list does not have to issue a request per row. */
  actorUsername: string | null
  ipAddress: string | null
  createdAt: Date
}

/** The audit log only ever sorts by when an action happened. */
export type AuditSortField = 'createdAt'

export type AuditFilter = {
  entityType?: string
  sort?: Sort<AuditSortField>
}

/** Shown for entries the platform wrote itself, which carry no operator. */
const SYSTEM_ACTOR = 'system'

export function auditActorLabel(entry: AuditEntry): string {
  return entry.actorUsername ?? SYSTEM_ACTOR
}
