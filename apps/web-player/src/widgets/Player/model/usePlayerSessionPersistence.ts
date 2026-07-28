'use client'

import {
  type MusicPlayerState,
  restorePlayerSession,
} from '@entities/Player/store/PlayerSlice'
import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { useAppDispatch } from '@shared/hooks'
import { useEffect, useRef } from 'react'

const PLAYER_SESSION_STORAGE_KEY = 'spotify:last-player-session'
const PLAYER_SESSION_PERSIST_INTERVAL_MS = 5000

type PersistedPlayerSession = {
  currentPlaylistId: string | null
  currentPlaylistName: string | null
  currentTime: number
  currentTrack: TrackEntity
  currentTrackIndex: number
  duration: number
  playlist: TrackEntity[]
  progress: number
  volume: number
}

export const usePlayerSessionPersistence = (
  player: MusicPlayerState,
  currentPlaylistName: string | null,
) => {
  const dispatch = useAppDispatch()
  const lastPersistedAtRef = useRef(0)
  const lastPersistedTrackIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (player.currentTrack) return

    try {
      const rawSession = window.localStorage.getItem(PLAYER_SESSION_STORAGE_KEY)
      if (!rawSession) return

      const session = JSON.parse(rawSession) as PersistedPlayerSession
      if (!session.currentTrack?.id) return

      dispatch(restorePlayerSession(session))
    } catch {
      window.localStorage.removeItem(PLAYER_SESSION_STORAGE_KEY)
    }
  }, [dispatch, player.currentTrack])

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
