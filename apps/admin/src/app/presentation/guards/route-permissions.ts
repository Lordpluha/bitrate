import type { Permission } from '@domain/access'

/**
 * Every permission-guarded route's path and required permission, in nav order.
 *
 * The single source `requirePermission` consults when an operator is denied one route, to find
 * the first one (in nav order) they can actually reach — see that guard for why.
 */
export const ROUTE_PERMISSIONS: readonly { path: string; permission: Permission }[] = [
  { path: '/moderation', permission: 'reports:read' },
  { path: '/catalog', permission: 'tracks:read' },
  { path: '/artists', permission: 'artists:read' },
  { path: '/users', permission: 'users:read' },
  { path: '/audit', permission: 'audit:read' },
  { path: '/roles', permission: 'roles:read' },
]
