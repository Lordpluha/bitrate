'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clientFetchClient } from '@/shared/api/client'
import { ensureOkResponse } from '@/shared/api/errors'
import { apiQueryKeys } from '@/shared/api/queryKeys'
import {
  meSettingsSchema,
  notificationsSchema,
  subscriptionSchema,
  type UpdateMeSettings,
  updateMeSettingsSchema,
} from './me.schemas'

export const useMeSettings = (enabled = true) =>
  useQuery({
    queryKey: apiQueryKeys.me.settings,
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/me/settings',
      )
      ensureOkResponse(response, 'Failed to load settings')
      return meSettingsSchema.parse(data)
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  })

export const useUpdateMeSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings: UpdateMeSettings) => {
      const body = updateMeSettingsSchema.parse(settings)
      const { data, response } = await clientFetchClient.PUT(
        '/api/v1/me/settings',
        { body },
      )
      ensureOkResponse(response, 'Failed to update settings')
      return meSettingsSchema.parse(data)
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(apiQueryKeys.me.settings, settings)
    },
  })
}

export const useNotifications = (page = 1, limit = 20, enabled = true) =>
  useQuery({
    queryKey: apiQueryKeys.me.notifications(page, limit),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/me/notifications',
        { params: { query: { limit, page } } },
      )
      ensureOkResponse(response, 'Failed to load notifications')
      return notificationsSchema.parse(data)
    },
    enabled,
    staleTime: 30 * 1000,
  })

const useNotificationMutation = (readAll: boolean) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId?: string) => {
      const { response } = readAll
        ? await clientFetchClient.PUT('/api/v1/me/notifications/read-all')
        : await clientFetchClient.PUT('/api/v1/me/notifications/{id}/read', {
            params: { path: { id: notificationId ?? '' } },
          })
      ensureOkResponse(response, 'Failed to update notifications')
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.me.all }),
  })
}

export const useReadNotification = () => useNotificationMutation(false)
export const useReadAllNotifications = () => useNotificationMutation(true)

export const useSubscription = (enabled = true) =>
  useQuery({
    queryKey: apiQueryKeys.me.subscription,
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/me/subscription',
      )
      ensureOkResponse(response, 'Failed to load subscription')
      return subscriptionSchema.parse(data)
    },
    enabled,
    staleTime: 10 * 60 * 1000,
  })
