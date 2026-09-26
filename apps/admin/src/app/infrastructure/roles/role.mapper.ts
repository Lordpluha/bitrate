import type { Permission } from '@domain/access'
import type { PermissionCatalogueEntry, Role } from '@domain/role'
import type { RoleDto, RolePermissionDto, WirePermission } from './role.dto'

/** See `staff.mapper.ts` — a permission the API grows later is a compile error at this record. */
const TO_DOMAIN_PERMISSION = {
  'reports:read': 'reports:read',
  'reports:advance': 'reports:advance',
  'artists:read': 'artists:read',
  'artists:verify': 'artists:verify',
  'artists:delete': 'artists:delete',
  'artists:restore': 'artists:restore',
  'artists:revoke-sessions': 'artists:revoke-sessions',
  'tracks:read': 'tracks:read',
  'tracks:reprocess': 'tracks:reprocess',
  'tracks:delete': 'tracks:delete',
  'tracks:restore': 'tracks:restore',
  'users:read': 'users:read',
  'users:delete': 'users:delete',
  'users:restore': 'users:restore',
  'users:revoke-sessions': 'users:revoke-sessions',
  'audit:read': 'audit:read',
  'staff:read': 'staff:read',
  'staff:write': 'staff:write',
  'roles:read': 'roles:read',
  'roles:write': 'roles:write',
  'overview:read': 'overview:read',
} as const satisfies Record<WirePermission, Permission>

export function toRole(dto: RoleDto): Role {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    builtIn: dto.builtIn,
    permissions: dto.permissions.map((permission) => TO_DOMAIN_PERMISSION[permission]),
    holders: dto.holders,
    divergentHolders: dto.divergentHolders,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  }
}

export function toPermissionCatalogueEntry(dto: RolePermissionDto): PermissionCatalogueEntry {
  return {
    permission: TO_DOMAIN_PERMISSION[dto.id],
    heldBy: dto.heldBy,
    protected: dto.protected,
  }
}
