import type { AdminResourceStatus } from './dtos/resource-status.schema'

/** The `deletedAt` condition a take-down `status` filter adds to any soft-deletable model. */
type ResourceStatusWhere = { deletedAt?: null | { not: null } }

/** Builds the `deletedAt` half of a list's `where` clause for the `status` take-down filter. */
export function statusWhere(status: AdminResourceStatus = 'active'): ResourceStatusWhere {
  if (status === 'all') return {}
  if (status === 'deactivated') return { deletedAt: { not: null } }
  return { deletedAt: null }
}
