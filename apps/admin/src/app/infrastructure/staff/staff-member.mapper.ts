import type { Permission } from '@domain/access'
import type { StaffMember, StaffMemberRole, StaffSortField } from '@domain/staff'
import type {
  StaffMemberDto,
  StaffMemberRoleDto,
  StaffMemberWirePermission,
  WireStaffSortField,
} from './staff-member.dto'

/**
 * See `staff.mapper.ts` — a permission the API grows later is a compile error at this record.
 * `null` marks one the API still stores but the panel retired (ADR-0066): it is dropped on
 * the way in, and its key goes when the contract loses it.
 */
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
  'podcasts:read': null,
  'podcasts:delete': null,
  'podcasts:restore': null,
  'releases:read': 'releases:read',
  'releases:review': 'releases:review',
} as const satisfies Record<StaffMemberWirePermission, Permission | null>

function toDomainPermissions(permissions: readonly StaffMemberWirePermission[]): Permission[] {
  return permissions.flatMap((permission) => TO_DOMAIN_PERMISSION[permission] ?? [])
}

/** See `artist.mapper.ts`'s `TO_WIRE_SORT`. */
const TO_WIRE_SORT = {
  username: 'username',
  email: 'email',
  createdAt: 'createdAt',
} as const satisfies Record<StaffSortField, NonNullable<WireStaffSortField>>

export function toWireStaffSort(field: StaffSortField): NonNullable<WireStaffSortField> {
  return TO_WIRE_SORT[field]
}

function toStaffMemberRole(dto: StaffMemberRoleDto): StaffMemberRole {
  return {
    id: dto.id,
    name: dto.name,
    permissions: toDomainPermissions(dto.permissions),
  }
}

export function toStaffMember(dto: StaffMemberDto): StaffMember {
  return {
    id: dto.id,
    email: dto.email,
    username: dto.username,
    role: toStaffMemberRole(dto.role),
    permissions: toDomainPermissions(dto.permissions),
    deactivatedAt: dto.deletedAt ? new Date(dto.deletedAt) : null,
    createdAt: new Date(dto.createdAt),
  }
}
