import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'
import { contractEnum } from './contract-union'

type StaffRole = ApiSchemas['StaffEntity']['role']

/** Not exported: only `Staff.role` consumes it, through `staffSchema`. */
const staffRoleSchema = contractEnum<StaffRole>()(['ADMIN', 'MODERATOR'])

type ContractStaff = Pick<ApiSchemas['StaffEntity'], 'id' | 'email' | 'username' | 'role'>

export const staffSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  username: z.string(),
  role: staffRoleSchema,
}) satisfies z.ZodType<ContractStaff>

export type Staff = z.infer<typeof staffSchema>

/**
 * The request body, so the contract's `LoginDto` is the shape and the messages are this app's.
 * `z.email()` alone would answer "invalid email" for an untouched field, which is why the
 * emptiness check comes first and pipes into it.
 */
export const loginRequestSchema = z.object({
  email: z.string().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
  password: z.string().min(1, 'Password is required'),
}) satisfies z.ZodType<ApiSchemas['LoginDto']>

export type LoginRequest = z.infer<typeof loginRequestSchema>
