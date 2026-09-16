import type { Permission } from '@domain/access'
import type { Staff } from '@domain/staff'
import type { StaffDto, WirePermission } from './staff.dto'

/** See `track.mapper.ts` — a permission the API grows later is a compile error at this record. */
const TO_DOMAIN_PERMISSION = {
  'reports:read': 'reports:read',
  'reports:advance': 'reports:advance',
  'artists:read': 'artists:read',
  'artists:verify': 'artists:verify',
  'artists:delete': 'artists:delete',
  'tracks:read': 'tracks:read',
  'tracks:reprocess': 'tracks:reprocess',
  'users:read': 'users:read',
  'users:delete': 'users:delete',
  'audit:read': 'audit:read',
  'staff:read': 'staff:read',
  'staff:write': 'staff:write',
  'roles:read': 'roles:read',
  'roles:write': 'roles:write',
} as const satisfies Record<WirePermission, Permission>

export function toStaff(dto: StaffDto): Staff {
  return {
    id: dto.id,
    email: dto.email,
    username: dto.username,
    roleId: dto.roleId,
    roleName: dto.role,
    permissions: dto.permissions.map((permission) => TO_DOMAIN_PERMISSION[permission]),
  }
}
