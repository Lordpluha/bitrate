/**
 * The permission catalogue. Permissions are code constants, not table rows: a permission only
 * means something if a route checks it, so code is the source of truth, not the database.
 */
export const PERMISSIONS = [
  'reports:read',
  'reports:advance',
  'artists:read',
  'artists:verify',
  'artists:delete',
  'tracks:read',
  'tracks:reprocess',
  'users:read',
  'users:delete',
  'audit:read',
  'staff:read',
  'staff:write',
  'roles:read',
  'roles:write',
] as const

/** A single permission id from the catalogue. */
export type Permission = (typeof PERMISSIONS)[number]

/**
 * Permissions only the built-in ADMIN role may ever hold. Never grantable to a custom role or
 * to an individual operator — {@link assertGrantable} rejects them.
 */
export const PROTECTED_PERMISSIONS = [
  'staff:read',
  'staff:write',
  'roles:read',
  'roles:write',
] as const

const PROTECTED_PERMISSION_SET = new Set<Permission>(PROTECTED_PERMISSIONS)

/** Every permission minus {@link PROTECTED_PERMISSIONS} — the built-in MODERATOR role's template. */
export const MODERATOR_TEMPLATE: Permission[] = PERMISSIONS.filter(
  (permission) => !PROTECTED_PERMISSION_SET.has(permission),
)
