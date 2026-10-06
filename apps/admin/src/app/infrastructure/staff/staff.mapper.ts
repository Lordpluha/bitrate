import type { Permission } from '@domain/access'
import type { Staff } from '@domain/staff'
import type { StaffDto, WirePermission } from './staff.dto'

/** See `track.mapper.ts` — a permission the API grows later is a compile error at this record. */
const TO_DOMAIN_PERMISSION = {
  'reports:read': 'reports:read',
  'reports:advance': 'reports:advance',
  'reports:export': 'reports:export',
  'artists:read': 'artists:read',
  'artists:verify': 'artists:verify',
  'artists:delete': 'artists:delete',
  'artists:restore': 'artists:restore',
  'artists:revoke-sessions': 'artists:revoke-sessions',
  'artists:export': 'artists:export',
  'tracks:read': 'tracks:read',
  'tracks:reprocess': 'tracks:reprocess',
  'tracks:delete': 'tracks:delete',
  'tracks:restore': 'tracks:restore',
  'tracks:export': 'tracks:export',
  'users:read': 'users:read',
  'users:delete': 'users:delete',
  'users:restore': 'users:restore',
  'users:revoke-sessions': 'users:revoke-sessions',
  'users:export': 'users:export',
  'audit:read': 'audit:read',
  'staff:read': 'staff:read',
  'staff:write': 'staff:write',
  'roles:read': 'roles:read',
  'roles:write': 'roles:write',
  'overview:read': 'overview:read',
  'genres:read': 'genres:read',
  'genres:write': 'genres:write',
  'genres:delete': 'genres:delete',
  'albums:read': 'albums:read',
  'albums:delete': 'albums:delete',
  'albums:restore': 'albums:restore',
  'playlists:read': 'playlists:read',
  'playlists:hide': 'playlists:hide',
  'playlists:delete': 'playlists:delete',
  'playlists:restore': 'playlists:restore',
  'podcasts:read': 'podcasts:read',
  'podcasts:delete': 'podcasts:delete',
  'podcasts:restore': 'podcasts:restore',
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
