import { ProtectedPermissionException, UnknownPermissionException } from './errors'
import { PERMISSIONS, PROTECTED_PERMISSIONS } from './permissions'

const PERMISSION_SET = new Set<string>(PERMISSIONS)
const PROTECTED_PERMISSION_SET = new Set<string>(PROTECTED_PERMISSIONS)

/**
 * Asserts that every id in `permissions` may be granted to a role or an individual operator.
 * @throws {UnknownPermissionException} if an id is not in the catalogue.
 * @throws {ProtectedPermissionException} if an id is `staff:*` or `roles:*` — grantable only to
 * the built-in ADMIN role by identity, never assigned directly.
 */
export function assertGrantable(permissions: readonly string[]): void {
  const unknown = permissions.filter((id) => !PERMISSION_SET.has(id))
  if (unknown.length > 0) throw new UnknownPermissionException(unknown)

  const protectedIds = permissions.filter((id) => PROTECTED_PERMISSION_SET.has(id))
  if (protectedIds.length > 0) throw new ProtectedPermissionException(protectedIds)
}
