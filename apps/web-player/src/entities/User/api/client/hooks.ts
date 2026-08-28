'use client'

import {
  clientFetchClient,
  fetchWithAuthRefresh,
  useMutation,
  useQuery,
} from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { getApiUrl } from '@shared/utils/mediaUrl'
import type { ApiSchemas } from '@spotify/contracts'
import {
  useQueryClient,
  useMutation as useTanStackMutation,
  useQuery as useTanStackQuery,
} from '@tanstack/react-query'
import {
  followedUsersResponseSchema,
  type PublicUser,
  publicUserResponseSchema,
  publicUsersResponseSchema,
} from './userResponse.schema'

export type SafeUser = PublicUser
export type UpdateUserPayload = ApiSchemas['UpdateUserDto']

export const mergePublicUserIntoAuthUser = (
  current: unknown,
  update: PublicUser,
) =>
  typeof current === 'object' && current !== null
    ? { ...current, ...update }
    : current

type UseUsersParams = {
  username: string
  page?: number
  limit?: number
}

export const useUsers = ({ username, page = 1, limit = 10 }: UseUsersParams) =>
  useQuery(
    'get',
    '/api/v1/users',
    {
      params: {
        query: { username, page, limit },
      },
    },
    {
      enabled: username.trim().length > 0,
      select: (data) => publicUsersResponseSchema.parse(data),
    },
  )

export const useUserByUsername = (username?: string) =>
  useQuery(
    'get',
    '/api/v1/users/username/{username}',
    {
      params: {
        path: { username: username ?? '' },
      },
    },
    {
      enabled: !!username,
      select: (data) => publicUserResponseSchema.parse(data),
    },
  )

export const useUserById = (userId?: string) =>
  useTanStackQuery({
    queryKey: apiQueryKeys.users.byId(userId ?? ''),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/users/{id}',
        {
          params: {
            path: { id: userId ?? '' },
          },
        } as never,
      )

      ensureOkResponse(response, 'Failed to fetch user')

      return publicUserResponseSchema.parse(data)
    },
    enabled: !!userId,
  })

export const useFollowedUsers = (enabled = true) =>
  useTanStackQuery({
    queryKey: apiQueryKeys.users.following,
    queryFn: getAllFollowedUsers,
    enabled,
    staleTime: 5 * 60_000,
  })

const FOLLOWED_USERS_PAGE_SIZE = 100

const getFollowedUsersPage = async (page: number) => {
  const { data, response } = await clientFetchClient.GET(
    '/api/v1/users/me/following',
    {
      params: { query: { limit: FOLLOWED_USERS_PAGE_SIZE, page } },
    },
  )
  ensureOkResponse(response, 'Failed to fetch followed users')
  return followedUsersResponseSchema.parse(data)
}

export const getAllFollowedUsers = async () => {
  const firstPage = await getFollowedUsersPage(1)
  const pageCount = Math.ceil(firstPage.total / firstPage.limit)
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(pageCount - 1, 0) }, (_, index) =>
      getFollowedUsersPage(index + 2),
    ),
  )

  return [firstPage, ...remainingPages].flatMap(({ data }) => data)
}

const useInvalidateFollowedUsers = () => {
  const queryClient = useQueryClient()

  return async () => {
    await queryClient.invalidateQueries({
      queryKey: apiQueryKeys.users.following,
    })
  }
}

export const useFollowUser = () => {
  const invalidate = useInvalidateFollowedUsers()

  return useMutation('post', '/api/v1/users/{id}/follow', {
    onSuccess: invalidate,
  })
}

export const useUnfollowUser = () => {
  const invalidate = useInvalidateFollowedUsers()

  return useMutation('delete', '/api/v1/users/{id}/follow', {
    onSuccess: invalidate,
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation('put', '/api/v1/users', {
    onSuccess: async (user) => {
      const publicUser = publicUserResponseSchema.parse(user)
      queryClient.setQueryData(apiQueryKeys.auth.me, (current: unknown) =>
        mergePublicUserIntoAuthUser(current, publicUser),
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: apiQueryKeys.auth.me }),
        queryClient.invalidateQueries({ queryKey: apiQueryKeys.users.all }),
      ])
    },
  })
}

export const useUploadUserAvatar = () => {
  const queryClient = useQueryClient()

  return useTanStackMutation({
    mutationFn: async (avatar: File) => {
      const formData = new FormData()
      formData.append('avatar', avatar)

      const response = await fetchWithAuthRefresh(
        getApiUrl('/api/v1/users/avatar'),
        {
          body: formData,
          method: 'POST',
        },
      )

      ensureOkResponse(response, 'Failed to upload avatar')

      return publicUserResponseSchema.parse(await response.json())
    },
    onSuccess: async (user) => {
      queryClient.setQueryData(apiQueryKeys.auth.me, (current: unknown) =>
        mergePublicUserIntoAuthUser(current, user),
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: apiQueryKeys.auth.me }),
        queryClient.invalidateQueries({ queryKey: apiQueryKeys.users.all }),
      ])
    },
  })
}
