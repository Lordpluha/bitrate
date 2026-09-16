import { coveringTuple } from '@domain/shared'

/**
 * Declared here rather than imported from `@bitrate/contracts`, so this layer depends on nothing
 * generated. The binding is not lost: `infrastructure/staff` maps the contract's union onto this
 * one through an exhaustive record, so a permission the API grows later is a compile error in the
 * mapper instead of an empty screen in front of an operator.
 */
export type Permission =
  | 'reports:read'
  | 'reports:advance'
  | 'artists:read'
  | 'artists:verify'
  | 'artists:delete'
  | 'tracks:read'
  | 'tracks:reprocess'
  | 'users:read'
  | 'users:delete'
  | 'audit:read'
  | 'staff:read'
  | 'staff:write'
  | 'roles:read'
  | 'roles:write'

/** Every permission the API can grant, stated once so a missing member is a compile error. */
export const PERMISSIONS = coveringTuple<Permission>()([
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
])

/**
 * The permissions that govern access to staff and role management. Kept separate so a future
 * staff/roles screen can gate itself without re-deriving this set from the full catalogue.
 */
export const PROTECTED_PERMISSIONS = coveringTuple<
  Extract<Permission, 'staff:read' | 'staff:write' | 'roles:read' | 'roles:write'>
>()(['staff:read', 'staff:write', 'roles:read', 'roles:write'])
