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
  'artists:restore',
  'artists:revoke-sessions',
  'tracks:read',
  'tracks:reprocess',
  'tracks:delete',
  'tracks:restore',
  'users:read',
  'users:delete',
  'users:restore',
  'users:revoke-sessions',
  'audit:read',
  'staff:read',
  'staff:write',
  'roles:read',
  'roles:write',
  'overview:read',
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

/**
 * The built-in MODERATOR role's template, written out rather than derived from
 * {@link PERMISSIONS}: a permission added to the catalogue reaches administrators by identity and
 * nobody else, so joining this template is a deliberate edit, never a side effect. Holds no
 * {@link PROTECTED_PERMISSIONS}. Only seeds the role on first boot — an administrator's later
 * edits to the stored template are kept.
 */
export const MODERATOR_TEMPLATE: readonly Permission[] = [
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
]
