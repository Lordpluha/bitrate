import type { ApiPaths, ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

/** See `WireArtistSortField` — read from the operation, not an entity field. */
export type WireUserSortField = NonNullable<
  ApiPaths['/api/v1/admin/users']['get']['parameters']['query']
>['sort']

type ContractUser = Pick<
  ApiSchemas['AdminUserEntity'],
  'id' | 'username' | 'email' | 'emailVerifiedAt' | 'createdAt' | 'deletedAt'
>

const userDto = z.object({
  id: z.uuid(),
  username: z.string(),
  email: z.email(),
  emailVerifiedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
}) satisfies z.ZodType<ContractUser>

export type UserDto = z.infer<typeof userDto>

type ContractUserPage = Omit<ApiSchemas['PaginatedAdminUsersEntity'], 'data'> & {
  data: ContractUser[]
}

export const userPageDto = z.object({
  data: z.array(userDto),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
}) satisfies z.ZodType<ContractUserPage>
