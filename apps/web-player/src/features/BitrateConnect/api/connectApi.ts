'use client'

import type { ApiSchemas } from '@bitrate/contracts'
import { clientFetchClient } from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { useQuery } from '@tanstack/react-query'
import {
  playerDeviceSchema,
  playerDevicesSchema,
  serverPlayerSchema,
} from '../model/connect.schemas'

type RegisterDeviceInput = {
  /** The id this browser saved last time; a removed device is registered again. */
  id: string | null
  isActive?: boolean
  name: string
}

/** Registers this browser as a `web` playback device and returns its id. */
export const registerDevice = async ({
  id,
  isActive,
  name,
}: RegisterDeviceInput): Promise<string> => {
  const body: ApiSchemas['UpsertDeviceDto'] = {
    ...(id ? { id } : {}),
    ...(isActive === undefined ? {} : { isActive }),
    name,
    type: 'web',
  }
  const { data, response } = await clientFetchClient.POST(
    '/api/v1/me/player/devices',
    { body },
  )
  if (response.status === 404 && id)
    return registerDevice({ id: null, isActive, name })
  ensureOkResponse(response, 'Failed to register this device')
  return playerDeviceSchema.parse(data).id
}

export const getServerPlayer = async () => {
  const { data, response } = await clientFetchClient.GET('/api/v1/me/player')
  ensureOkResponse(response, 'Failed to load the saved player')
  return serverPlayerSchema.parse(data ?? null)
}

export const saveServerPlayer = async (body: ApiSchemas['UpdatePlayerDto']) => {
  const { response } = await clientFetchClient.PUT('/api/v1/me/player', {
    body,
  })
  ensureOkResponse(response, 'Failed to save the player')
}

export const saveServerQueue = async (body: ApiSchemas['UpdateQueueDto']) => {
  const { response } = await clientFetchClient.PUT('/api/v1/me/player/queue', {
    body,
  })
  ensureOkResponse(response, 'Failed to save the queue')
}

/** The account's playback devices, the active one first. */
export const usePlayerDevices = (enabled: boolean) =>
  useQuery({
    enabled,
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/me/player/devices',
      )
      ensureOkResponse(response, 'Failed to load devices')
      return playerDevicesSchema.parse(data)
    },
    queryKey: apiQueryKeys.me.playerDevices,
  })
