import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'
import { contractEnum } from '../http/contract-union'

/**
 * The permission union as the API declares it. See `infrastructure/staff/staff.dto.ts` for why
 * this is stated again here rather than imported from there: each infra slice owns the wire
 * shape it actually receives, and the mapper below joins it to the domain through an exhaustive
 * record.
 */
export type WirePermission = ApiSchemas['RoleEntity']['permissions'][number]

const wirePermissionDto = contractEnum<WirePermission>()([
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
])

type ContractRole = Pick<
  ApiSchemas['RoleEntity'],
  | 'id'
  | 'name'
  | 'description'
  | 'builtIn'
  | 'permissions'
  | 'holders'
  | 'divergentHolders'
  | 'createdAt'
  | 'updatedAt'
>

export const roleDto = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  builtIn: z.boolean(),
  permissions: z.array(wirePermissionDto),
  holders: z.number().int(),
  divergentHolders: z.number().int(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}) satisfies z.ZodType<ContractRole>

export type RoleDto = z.infer<typeof roleDto>

export const roleListDto = z.array(roleDto)

type ContractRolePermission = Pick<
  ApiSchemas['RolePermissionEntity'],
  'id' | 'heldBy' | 'protected'
>

export const rolePermissionDto = z.object({
  id: wirePermissionDto,
  heldBy: z.number().int(),
  protected: z.boolean(),
}) satisfies z.ZodType<ContractRolePermission>

export type RolePermissionDto = z.infer<typeof rolePermissionDto>

export const rolePermissionListDto = z.array(rolePermissionDto)

/**
 * Request bodies, bound to the contract like every response DTO above. A narrower union or a
 * renamed field on the API side is a compile error here rather than a 400 in front of an operator.
 */
export const createRoleBodyDto = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  permissions: z.array(wirePermissionDto).default([]),
}) satisfies z.ZodType<ApiSchemas['CreateRoleDto']>

export const updateRoleBodyDto = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  permissions: z.array(wirePermissionDto).optional(),
}) satisfies z.ZodType<ApiSchemas['UpdateRoleDto']>
