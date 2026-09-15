import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'
import { contractEnum } from '../http/contract-union'

/** The union as the API declares it. The domain declares its own; the mapper joins them. */
export type WireStaffRole = ApiSchemas['StaffEntity']['role']

const staffRoleDto = contractEnum<WireStaffRole>()(['ADMIN', 'MODERATOR'])

type ContractStaff = Pick<ApiSchemas['StaffEntity'], 'id' | 'email' | 'username' | 'role'>

export const staffDto = z.object({
  id: z.uuid(),
  email: z.email(),
  username: z.string(),
  role: staffRoleDto,
}) satisfies z.ZodType<ContractStaff>

export type StaffDto = z.infer<typeof staffDto>

/** The request body, so the contract's `LoginDto` stays the shape that goes over the wire. */
export const signInBodyDto = z.object({
  email: z.string(),
  password: z.string(),
}) satisfies z.ZodType<ApiSchemas['LoginDto']>
