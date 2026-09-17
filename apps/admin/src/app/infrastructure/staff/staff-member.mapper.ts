import type { Permission } from '@domain/access'
import type { StaffMember, StaffMemberRole, StaffSortField } from '@domain/staff'
import type {
  StaffMemberDto,
  StaffMemberRoleDto,
  StaffMemberWirePermission,
  WireStaffSortField,
} from './staff-member.dto'

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
} as const satisfies Record<StaffMemberWirePermission, Permission>

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
    permissions: dto.permissions.map((permission) => TO_DOMAIN_PERMISSION[permission]),
  }
}

export function toStaffMember(dto: StaffMemberDto): StaffMember {
  return {
    id: dto.id,
    email: dto.email,
    username: dto.username,
    role: toStaffMemberRole(dto.role),
    permissions: dto.permissions.map((permission) => TO_DOMAIN_PERMISSION[permission]),
    deactivatedAt: dto.deletedAt ? new Date(dto.deletedAt) : null,
    createdAt: new Date(dto.createdAt),
  }
}
