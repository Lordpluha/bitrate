'use client'

import { clientFetchClient } from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import type { PlaybackEventBody } from '@/entities/PlaybackEvent/model/playbackEvent.types'

type PostPlaybackEventInput = {
  body: PlaybackEventBody
  /** Lets the request outlive the page; set when the tab is being closed. */
  keepalive?: boolean
}

/**
 * `POST /me/playback-events`. Best effort: a lost report costs one signal, and the server stores a
 * retried report once, so callers fire and forget.
 */
export const postPlaybackEvent = async ({
  body,
  keepalive,
}: PostPlaybackEventInput) => {
  const { response } = await clientFetchClient.POST(
    '/api/v1/me/playback-events',
    {
      body,
      ...(keepalive ? { keepalive: true } : {}),
    },
  )
  ensureOkResponse(response, 'Failed to report a playback event')
}
