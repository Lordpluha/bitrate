'use client'

import {
  selectCurrentPlaylistId,
  selectIsPlaying,
  usePlayerStore,
} from '@entities/Player'
import type { TrackEntity } from '@entities/Track'
import { useCallback } from 'react'

export type UseArtistPlaybackInput = {
  artistId: string
  artistName: string
  tracks: TrackEntity[]
}

const shuffleTracks = (tracks: TrackEntity[]) => {
  const shuffled = [...tracks]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = shuffled[index]
    const target = shuffled[swapIndex]
    if (!current || !target) continue
    shuffled[index] = target
    shuffled[swapIndex] = current
  }

  return shuffled
}

/** Play / shuffle / track-select handlers scoped to one artist's catalogue. */
export const useArtistPlayback = ({
  artistId,
  artistName,
  tracks,
}: UseArtistPlaybackInput) => {
  const playPlaylist = usePlayerStore((state) => state.playPlaylist)
  const togglePlay = usePlayerStore((state) => state.togglePlay)
  const setShuffleEnabled = usePlayerStore((state) => state.setShuffleEnabled)
  const currentPlaylistId = usePlayerStore(selectCurrentPlaylistId)
  const isPlaying = usePlayerStore(selectIsPlaying)

  const playbackId = `artist:${artistId}`
  const isContextActive = currentPlaylistId === playbackId

  const playFrom = useCallback(
    (list: TrackEntity[], startIndex: number) => {
      const startTrack = list[startIndex]
      if (!startTrack) return

      playPlaylist({
        currentPlaylistId: playbackId,
        currentPlaylistName: artistName,
        startTrack,
        startTrackIndex: startIndex,
        tracks: list,
      })
    },
    [playPlaylist, playbackId, artistName],
  )

  const handleTogglePlay = useCallback(() => {
    if (isContextActive) {
      togglePlay()
      return
    }
    playFrom(tracks, 0)
  }, [isContextActive, togglePlay, playFrom, tracks])

  const handleShuffle = useCallback(() => {
    if (tracks.length === 0) return
    setShuffleEnabled(true)
    playFrom(shuffleTracks(tracks), 0)
  }, [tracks, setShuffleEnabled, playFrom])

  const handlePlayTrack = useCallback(
    (_track: TrackEntity, index: number) => playFrom(tracks, index),
    [playFrom, tracks],
  )

  return {
    handlePlayTrack,
    handleShuffle,
    handleTogglePlay,
    isContextActive,
    isPlaying: isContextActive && isPlaying,
  }
}
