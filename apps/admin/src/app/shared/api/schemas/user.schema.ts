import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

type ContractUser = Pick<
  ApiSchemas['AdminUserEntity'],
  'id' | 'username' | 'email' | 'emailVerifiedAt' | 'createdAt' | 'deletedAt'
>

/** Not exported: consumers need the inferred type and the page envelope, not this. */
const adminUserSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  email: z.email(),
  emailVerifiedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
}) satisfies z.ZodType<ContractUser>

export type AdminUser = z.infer<typeof adminUserSchema>

type ContractUserPage = Omit<ApiSchemas['PaginatedAdminUsersEntity'], 'data'> & {
  data: ContractUser[]
}

export const adminUserPageSchema = z.object({
  data: z.array(adminUserSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
}) satisfies z.ZodType<ContractUserPage>
