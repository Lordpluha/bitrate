'use client'

import {
  setPlaylistTracks,
  setShuffleEnabled,
} from '@entities/Player/store/PlayerSlice'
import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { useAppDispatch } from '@shared/hooks'
import { useCallback, useEffect, useRef } from 'react'

type UsePlaylistShuffleOptions = {
  currentTrack: TrackEntity | null
  isShuffled: boolean
  playlist: TrackEntity[]
}

const shuffleTracks = (tracks: TrackEntity[]) => {
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
  currentTrack,
  isShuffled,
  playlist,
}: UsePlaylistShuffleOptions) => {
  const dispatch = useAppDispatch()
  const originalPlaylistRef = useRef<TrackEntity[]>([])

  useEffect(() => {
    if (!isShuffled) {
      originalPlaylistRef.current = playlist
    }
  }, [isShuffled, playlist])

  return useCallback(() => {
    if (!currentTrack) return

    if (playlist.length < 2) {
      dispatch(setShuffleEnabled(!isShuffled))
      return
    }

    if (isShuffled) {
      if (originalPlaylistRef.current.length > 0) {
        dispatch(setPlaylistTracks(originalPlaylistRef.current))
      }
      dispatch(setShuffleEnabled(false))
      return
    }

    originalPlaylistRef.current = playlist
    const remainingTracks = playlist.filter(
      (track) => track.id !== currentTrack.id,
    )

    dispatch(
      setPlaylistTracks([currentTrack, ...shuffleTracks(remainingTracks)]),
    )
    dispatch(setShuffleEnabled(true))
  }, [currentTrack, dispatch, isShuffled, playlist])
}
