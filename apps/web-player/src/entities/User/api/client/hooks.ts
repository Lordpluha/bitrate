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

export type SafeUser = ApiSchemas['SafeUserEntity']
export type UpdateUserPayload = ApiSchemas['UpdateUserDto']

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
        path: { username, page, limit },
      },
    },
    {
      enabled: username.trim().length > 0,
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

      return data as unknown as SafeUser
    },
    enabled: !!userId,
  })

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation('put', '/api/v1/users', {
    onSuccess: async (user) => {
      queryClient.setQueryData(apiQueryKeys.auth.me, user)
      await queryClient.invalidateQueries({ queryKey: apiQueryKeys.users.all })
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

      return (await response.json()) as SafeUser
    },
    onSuccess: async (user) => {
      queryClient.setQueryData(apiQueryKeys.auth.me, user)
      await queryClient.invalidateQueries({ queryKey: apiQueryKeys.users.all })
    },
  })
}
