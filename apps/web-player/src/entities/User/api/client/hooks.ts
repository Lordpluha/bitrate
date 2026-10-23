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
import {
  useQueryClient,
  useMutation as useTanStackMutation,
  useQuery as useTanStackQuery,
} from '@tanstack/react-query'
import { fetchAllPages } from '@/shared/api/fetchAllPages'
import {
  followedUsersResponseSchema,
  followingActivityResponseSchema,
  type PublicUser,
  publicUserResponseSchema,
  publicUsersResponseSchema,
} from './userResponse.schema'

export type SafeUser = PublicUser

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

export const useUserById = (userId?: string) =>
  useTanStackQuery({
    queryKey: apiQueryKeys.users.byId(userId ?? ''),
    /**
     * Raw fetch: the generated contract declares no path params for
     * `GET /users/{id}`, so the typed client cannot fill `{id}`.
     */
    queryFn: async () => {
      const response = await fetchWithAuthRefresh(
        getApiUrl(`/api/v1/users/${encodeURIComponent(userId ?? '')}`),
      )

      ensureOkResponse(response, 'Failed to fetch user')

      return publicUserResponseSchema.parse(await response.json())
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

/** What followed people last played; refreshed every minute while a panel shows it. */
export const useFollowingActivity = (enabled = true) =>
  useTanStackQuery({
    queryKey: apiQueryKeys.users.followingActivity,
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/users/me/following/activity',
      )
      ensureOkResponse(response, 'Failed to load friend activity')
      return followingActivityResponseSchema.parse(data)
    },
    enabled,
    refetchInterval: 60_000,
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

export const getAllFollowedUsers = () =>
  fetchAllPages({ fetchPage: getFollowedUsersPage })

const useInvalidateFollowedUsers = () => {
  const queryClient = useQueryClient()

  return async () => {
    await queryClient.invalidateQueries({
      queryKey: apiQueryKeys.users.following,
    })
  }
}

/** Fallback for the mutation cache's error toast. */
const FOLLOW_ERROR_MESSAGE = 'Could not update follow state'

export const useFollowUser = () => {
  const invalidate = useInvalidateFollowedUsers()

  return useMutation('post', '/api/v1/users/{id}/follow', {
    meta: { errorMessage: FOLLOW_ERROR_MESSAGE },
    onSuccess: invalidate,
  })
}

export const useUnfollowUser = () => {
  const invalidate = useInvalidateFollowedUsers()

  return useMutation('delete', '/api/v1/users/{id}/follow', {
    meta: { errorMessage: FOLLOW_ERROR_MESSAGE },
    onSuccess: invalidate,
  })
}

/**
 * Writes a saved profile into the signed-in user and refetches only that person's
 * public profile; follow lists and activity show other people, so they stay cached.
 */
const useApplyUserUpdate = () => {
  const queryClient = useQueryClient()

  return async (user: PublicUser) => {
    queryClient.setQueryData(apiQueryKeys.auth.me, (current: unknown) =>
      mergePublicUserIntoAuthUser(current, user),
    )
    await queryClient.invalidateQueries({
      queryKey: apiQueryKeys.users.byId(user.id),
    })
  }
}

export const useUpdateUser = () => {
  const applyUserUpdate = useApplyUserUpdate()

  return useMutation('put', '/api/v1/users', {
    meta: { errorMessage: 'Failed to update profile' },
    onSuccess: (user) => applyUserUpdate(publicUserResponseSchema.parse(user)),
  })
}

export const useUploadUserAvatar = () => {
  const applyUserUpdate = useApplyUserUpdate()

  return useTanStackMutation({
    meta: { errorMessage: 'Failed to upload avatar' },
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
    onSuccess: applyUserUpdate,
  })
}

export type UserFollowKind = 'followers' | 'following'

type UseUserFollowsInput = {
  kind: UserFollowKind
  limit?: number
  userId: string
}

const getUserFollowsPage = async ({
  kind,
  limit = 20,
  userId,
}: UseUserFollowsInput) => {
  const params = { path: { id: userId }, query: { limit, page: 1 } }
  const { data, response } =
    kind === 'followers'
      ? await clientFetchClient.GET('/api/v1/users/{id}/followers', { params })
      : await clientFetchClient.GET('/api/v1/users/{id}/following', { params })
  /** The person keeps these lists private (`followersVisible`); not an error to show. */
  if (response.status === 403) return { isHidden: true as const }
  ensureOkResponse(response, `Failed to load ${kind}`)
  return {
    isHidden: false as const,
    ...followedUsersResponseSchema.parse(data),
  }
}

/** First page of who follows a person, or whom they follow (`GET /users/{id}/followers|following`). */
export const useUserFollows = ({
  kind,
  limit = 20,
  userId,
}: UseUserFollowsInput) =>
  useTanStackQuery({
    enabled: Boolean(userId),
    queryFn: () => getUserFollowsPage({ kind, limit, userId }),
    queryKey: apiQueryKeys.users.follows(userId, kind, limit),
    retry: false,
  })
