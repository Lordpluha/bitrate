'use client'

import { type PlayerState, usePlayerStore } from '@entities/Player'
import { useCallback, useEffect, useRef } from 'react'

type UsePlaylistShuffleOptions = Pick<
  PlayerState,
  'currentQueueId' | 'currentTrack' | 'isShuffled' | 'playlist'
>

const shuffleTracks = (tracks: PlayerState['playlist']) => {
  const shuffledTracks = [...tracks]

  for (let index = shuffledTracks.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const current = shuffledTracks[index]
    const randomTrack = shuffledTracks[randomIndex]

    if (!current || !randomTrack) continue

    shuffledTracks[index] = randomTrack
    shuffledTracks[randomIndex] = current
  }

  return shuffledTracks
}

export const usePlaylistShuffle = ({
  currentQueueId,
  currentTrack,
  isShuffled,
  playlist,
}: UsePlaylistShuffleOptions) => {
  const setPlaylistTracks = usePlayerStore((state) => state.setPlaylistTracks)
  const setShuffleEnabled = usePlayerStore((state) => state.setShuffleEnabled)
  const originalPlaylistRef = useRef<PlayerState['playlist']>([])

  useEffect(() => {
    if (!isShuffled) {
      originalPlaylistRef.current = playlist
    }
  }, [isShuffled, playlist])

  return useCallback(() => {
    if (!currentTrack || currentQueueId) return
    if (!playlist.some((track) => track.id === currentTrack.id)) return

    if (playlist.length < 2) {
      setShuffleEnabled(!isShuffled)
      return
    }

    if (isShuffled) {
      if (originalPlaylistRef.current.length > 0) {
        setPlaylistTracks(originalPlaylistRef.current)
      }
      setShuffleEnabled(false)
      return
    }

    originalPlaylistRef.current = playlist
    const remainingTracks = playlist.filter(
      (track) => track.id !== currentTrack.id,
    )

    setPlaylistTracks([currentTrack, ...shuffleTracks(remainingTracks)])
    setShuffleEnabled(true)
  }, [
    currentQueueId,
    currentTrack,
    isShuffled,
    playlist,
    setPlaylistTracks,
    setShuffleEnabled,
  ])
}
