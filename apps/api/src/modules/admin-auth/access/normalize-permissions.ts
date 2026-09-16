import { PERMISSIONS, type Permission } from './permissions'

const CATALOGUE_ORDER = new Map<string, number>(
  PERMISSIONS.map((permission, index) => [permission, index]),
)

/**
 * Dedupes a permission set and orders it by the catalogue before it is stored.
 *
 * Sets are persisted as `text[]`, and an array is ordered: the same grant saved as `[b, a]`, or
 * with a repeated entry, is a different value from the template's `[a, b]`. Without this, the
 * divergence count and the audit diff would report an operator as changed when nothing was.
 */
export function normalizePermissions(permissions: readonly Permission[]): Permission[] {
  return [...new Set(permissions)].sort(
    (a, b) => (CATALOGUE_ORDER.get(a) ?? 0) - (CATALOGUE_ORDER.get(b) ?? 0),
  )
}
