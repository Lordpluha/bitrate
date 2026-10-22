'use client'

import { clientFetchClient } from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  friendRequestsSchema,
  friendsSchema,
  sendFriendRequestSchema,
} from './friends.schemas'

/** Presence goes stale fast; the list refreshes while it is on screen. */
const FRIENDS_REFRESH_MS = 60_000

export const useFriends = () =>
  useQuery({
    queryKey: apiQueryKeys.friends.list,
    queryFn: async () => {
      const { data, response } =
        await clientFetchClient.GET('/api/v1/me/friends')
      ensureOkResponse(response, 'Failed to load friends')
      return friendsSchema.parse(data)
    },
    refetchInterval: FRIENDS_REFRESH_MS,
  })

export const useFriendRequests = (direction: 'incoming' | 'outgoing') =>
  useQuery({
    queryKey: apiQueryKeys.friends.requests(direction),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/me/friend-requests',
        { params: { query: { direction } } },
      )
      ensureOkResponse(response, 'Failed to load friend requests')
      return friendRequestsSchema.parse(data)
    },
  })

type FriendsMutationInput<TInput, TResult> = {
  /** Fallback for the global error toast when the failure carries no message. */
  errorMessage: string
  mutationFn: (input: TInput) => Promise<TResult>
}

/**
 * Every friend change touches the lists and may answer a request notification.
 * Failures are toasted once by the query client's mutation cache.
 */
const useFriendsMutation = <TInput, TResult>({
  errorMessage,
  mutationFn,
}: FriendsMutationInput<TInput, TResult>) => {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { errorMessage },
    mutationFn,
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: apiQueryKeys.friends.all }),
        queryClient.invalidateQueries({ queryKey: apiQueryKeys.me.all }),
      ]),
  })
}

/** Sends a request; `accepted` when they had already asked, which makes you friends. */
export const useSendFriendRequest = () =>
  useFriendsMutation({
    errorMessage: 'Unable to send the friend request.',
    mutationFn: async (userId: string) => {
      const { data, response } = await clientFetchClient.POST(
        '/api/v1/users/{id}/friend-request',
        { params: { path: { id: userId } } },
      )
      ensureOkResponse(response, 'Failed to send the friend request')
      return sendFriendRequestSchema.parse(data)
    },
  })

export const useAcceptFriendRequest = () =>
  useFriendsMutation({
    errorMessage: 'Unable to accept the request.',
    mutationFn: async (requestId: string) => {
      const { response } = await clientFetchClient.POST(
        '/api/v1/friend-requests/{id}/accept',
        { params: { path: { id: requestId } } },
      )
      ensureOkResponse(response, 'Failed to accept the friend request')
    },
  })

export const useDeclineFriendRequest = () =>
  useFriendsMutation({
    errorMessage: 'Unable to decline the request.',
    mutationFn: async (requestId: string) => {
      const { response } = await clientFetchClient.POST(
        '/api/v1/friend-requests/{id}/decline',
        { params: { path: { id: requestId } } },
      )
      ensureOkResponse(response, 'Failed to decline the friend request')
    },
  })

export const useCancelFriendRequest = () =>
  useFriendsMutation({
    errorMessage: 'Unable to cancel the request.',
    mutationFn: async (requestId: string) => {
      const { response } = await clientFetchClient.DELETE(
        '/api/v1/friend-requests/{id}',
        { params: { path: { id: requestId } } },
      )
      ensureOkResponse(response, 'Failed to cancel the friend request')
    },
  })

export const useRemoveFriend = () =>
  useFriendsMutation({
    errorMessage: 'Unable to remove the friend.',
    mutationFn: async (userId: string) => {
      const { response } = await clientFetchClient.DELETE(
        '/api/v1/me/friends/{userId}',
        { params: { path: { userId } } },
      )
      ensureOkResponse(response, 'Failed to remove the friend')
    },
  })
