import type { ApiPaths, ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

/** See `WireArtistSortField` — read from the operation, not an entity field. */
export type WireUserSortField = NonNullable<
  ApiPaths['/api/v1/admin/users']['get']['parameters']['query']
>['sort']

/** The `status` query parameter's own union, read from the operation directly. */
export type WireUserStatus = NonNullable<
  ApiPaths['/api/v1/admin/users']['get']['parameters']['query']
>['status']

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

type ContractUserCounts = ApiSchemas['AdminUserCountsEntity']

const userCountsDto = z.object({
  playlists: z.number().int(),
  likedTracks: z.number().int(),
  listeningHistory: z.number().int(),
  reportsFiled: z.number().int(),
  activeSessions: z.number().int(),
}) satisfies z.ZodType<ContractUserCounts>

type ContractUserDetail = Pick<
  ApiSchemas['AdminUserDetailEntity'],
  'id' | 'username' | 'email' | 'emailVerifiedAt' | 'createdAt' | 'deletedAt' | 'counts'
>

export const userDetailDto = z.object({
  id: z.uuid(),
  username: z.string(),
  email: z.email(),
  emailVerifiedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
  counts: userCountsDto,
}) satisfies z.ZodType<ContractUserDetail>

export type UserDetailDto = z.infer<typeof userDetailDto>
