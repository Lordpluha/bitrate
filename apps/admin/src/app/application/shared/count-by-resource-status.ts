import type { Page, PageRequest, ResourceStatus } from '@domain/shared'

/** Live and taken-down totals of one soft-deletable resource. */
export type ResourceCounts = {
  live: number
  takenDown: number
}

/** A repository's `list`, narrowed to what counting needs: a page request and a status filter. */
type ListByStatus = (
  query: PageRequest & { filter: { status: ResourceStatus } },
) => Promise<Page<unknown>>

/**
 * Counts a soft-deletable resource (ADR-0051) from its own list endpoint — one row per status,
 * using only the page total. Both requests run together; either failing fails the count, so a
 * KPI strip never shows half its figures.
 */
export async function countByResourceStatus(list: ListByStatus): Promise<ResourceCounts> {
  const [live, takenDown] = await Promise.all([
    list({ page: 1, limit: 1, filter: { status: 'active' } }),
    list({ page: 1, limit: 1, filter: { status: 'deactivated' } }),
  ])
  return { live: live.total, takenDown: takenDown.total }
}
