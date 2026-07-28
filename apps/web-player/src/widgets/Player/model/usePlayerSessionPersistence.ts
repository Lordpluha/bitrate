'use client'

import {
  type PlayerSnapshot,
  type PlayerState,
  usePlayerStore,
} from '@entities/Player'
import { useEffect, useRef } from 'react'

const PLAYER_SESSION_STORAGE_KEY = 'spotify:last-player-session'
const PLAYER_SESSION_PERSIST_INTERVAL_MS = 5000

type PersistedPlayerSession = Pick<
  PlayerSnapshot,
  | 'currentPlaylistId'
  | 'currentPlaylistName'
  | 'currentTime'
  | 'currentTrackIndex'
  | 'duration'
  | 'playlist'
  | 'progress'
  | 'volume'
> & {
  currentTrack: NonNullable<PlayerSnapshot['currentTrack']>
}

export const usePlayerSessionPersistence = (
  player: PlayerState,
  currentPlaylistName: string | null,
) => {
  const restorePlayerSession = usePlayerStore(
    (state) => state.restorePlayerSession,
  )
  const lastPersistedAtRef = useRef(0)
  const lastPersistedTrackIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (player.currentTrack) return

    try {
      const rawSession = window.localStorage.getItem(PLAYER_SESSION_STORAGE_KEY)
      if (!rawSession) return

      const session = JSON.parse(rawSession) as PersistedPlayerSession
      if (!session.currentTrack?.id) return

      restorePlayerSession(session)
    } catch {
      window.localStorage.removeItem(PLAYER_SESSION_STORAGE_KEY)
    }
  }, [player.currentTrack, restorePlayerSession])

  useEffect(() => {
    const { currentTrack } = player
    if (!currentTrack) return

    const now = Date.now()
    const hasTrackChanged = lastPersistedTrackIdRef.current !== currentTrack.id

    if (
      !hasTrackChanged &&
      now - lastPersistedAtRef.current < PLAYER_SESSION_PERSIST_INTERVAL_MS
    ) {
      return
    }

    const session: PersistedPlayerSession = {
      currentPlaylistId: player.currentPlaylistId,
      currentPlaylistName,
      currentTime: player.currentTime,
      currentTrack,
      currentTrackIndex: player.currentTrackIndex,
      duration: player.duration,
      playlist: player.playlist,
      progress: player.progress,
      volume: player.volume,
    }

    window.localStorage.setItem(
      PLAYER_SESSION_STORAGE_KEY,
      JSON.stringify(session),
    )
    lastPersistedAtRef.current = now
    lastPersistedTrackIdRef.current = currentTrack.id
  }, [currentPlaylistName, player])
}
