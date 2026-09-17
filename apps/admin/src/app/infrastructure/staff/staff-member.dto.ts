import type { ApiPaths, ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'
import { contractEnum } from '../http/contract-union'

/** See `WireArtistSortField` — read from the operation, not an entity field. */
export type WireStaffSortField = NonNullable<
  ApiPaths['/api/v1/admin/staff']['get']['parameters']['query']
>['sort']

/**
 * The permission union as the API declares it for the operator directory. See
 * `staff.dto.ts` for why this is stated again here rather than shared: each infra slice owns
 * the wire shape it actually receives, and the mapper below joins it to the domain through an
 * exhaustive record.
 */
export type StaffMemberWirePermission = ApiSchemas['AdminStaffEntity']['permissions'][number]

const wirePermissionDto = contractEnum<StaffMemberWirePermission>()([
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

type ContractStaffMemberRole = Pick<
  ApiSchemas['AdminStaffRoleEntity'],
  'id' | 'name' | 'permissions'
>

export const staffMemberRoleDto = z.object({
  id: z.uuid(),
  name: z.string(),
  permissions: z.array(wirePermissionDto),
}) satisfies z.ZodType<ContractStaffMemberRole>

export type StaffMemberRoleDto = z.infer<typeof staffMemberRoleDto>

type ContractStaffMember = Pick<
  ApiSchemas['AdminStaffEntity'],
  'id' | 'email' | 'username' | 'role' | 'permissions' | 'deletedAt' | 'createdAt'
>

export const staffMemberDto = z.object({
  id: z.uuid(),
  email: z.email(),
  username: z.string(),
  role: staffMemberRoleDto,
  permissions: z.array(wirePermissionDto),
  deletedAt: z.iso.datetime().nullable().optional(),
  createdAt: z.iso.datetime(),
}) satisfies z.ZodType<ContractStaffMember>

export type StaffMemberDto = z.infer<typeof staffMemberDto>

type ContractStaffMemberPage = Omit<ApiSchemas['PaginatedAdminStaffEntity'], 'data'> & {
  data: ContractStaffMember[]
}

export const staffMemberPageDto = z.object({
  data: z.array(staffMemberDto),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
}) satisfies z.ZodType<ContractStaffMemberPage>

/**
 * Request bodies, bound to the contract like every response DTO above. `password` also
 * enforces the API's own 12-character floor, so a stale contract cannot silently widen it.
 */
export const createStaffBodyDto = z.object({
  email: z.email(),
  username: z.string().min(1),
  password: z.string().min(12),
  roleId: z.uuid(),
  permissions: z.array(wirePermissionDto).optional(),
}) satisfies z.ZodType<ApiSchemas['CreateStaffDto']>

export const assignStaffRoleBodyDto = z.object({
  roleId: z.uuid(),
  permissions: z.array(wirePermissionDto).optional(),
}) satisfies z.ZodType<ApiSchemas['AssignStaffRoleDto']>

export const updateStaffPermissionsBodyDto = z.object({
  permissions: z.array(wirePermissionDto),
}) satisfies z.ZodType<ApiSchemas['UpdateStaffPermissionsDto']>
