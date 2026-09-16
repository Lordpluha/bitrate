import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'
import { contractEnum } from '../http/contract-union'

/**
 * The permission union as the API declares it. The domain declares its own `Permission`; the
 * mapper joins them through an exhaustive record, so a permission the API adds later is a
 * compile error here rather than a `parse` failure in front of an operator.
 */
export type WirePermission = ApiSchemas['StaffEntity']['permissions'][number]

const wirePermissionDto = contractEnum<WirePermission>()([
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

type ContractStaff = Pick<
  ApiSchemas['StaffEntity'],
  'id' | 'email' | 'username' | 'roleId' | 'role' | 'permissions'
>

export const staffDto = z.object({
  id: z.uuid(),
  email: z.email(),
  username: z.string(),
  roleId: z.string(),
  role: z.string(),
  permissions: z.array(wirePermissionDto),
}) satisfies z.ZodType<ContractStaff>

export type StaffDto = z.infer<typeof staffDto>

/** The request body, so the contract's `LoginDto` stays the shape that goes over the wire. */
export const signInBodyDto = z.object({
  email: z.string(),
  password: z.string(),
}) satisfies z.ZodType<ApiSchemas['LoginDto']>
