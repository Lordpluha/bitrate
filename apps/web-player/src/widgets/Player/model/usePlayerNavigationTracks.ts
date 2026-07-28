'use client'

import {
  selectCurrentTrack,
  selectCurrentTrackIndex,
  selectPlaylist,
} from '@/entities/Player'
import type { TrackEntity } from '@/entities/Track/models/schema/Track.entity'
import { useAppSelector } from '@/shared/hooks'

interface PlayerNavigationTracks {
  nextTrack: TrackEntity | null
  previousTrack: TrackEntity | null
}

export const usePlayerNavigationTracks = (): PlayerNavigationTracks => {
  const currentTrack = useAppSelector(selectCurrentTrack)
  const currentTrackIndex = useAppSelector(selectCurrentTrackIndex)
  const playlist = useAppSelector(selectPlaylist)

  if (!currentTrack || playlist.length < 2) {
    return { nextTrack: null, previousTrack: null }
  }

  const activeIndex =
    currentTrackIndex >= 0 &&
    playlist[currentTrackIndex]?.id === currentTrack.id
      ? currentTrackIndex
      : playlist.findIndex((track) => track.id === currentTrack.id)

  if (activeIndex < 0) {
    return { nextTrack: null, previousTrack: null }
  }

  const previousIndex =
    activeIndex === 0 ? playlist.length - 1 : activeIndex - 1
  const nextIndex = (activeIndex + 1) % playlist.length

  return {
    nextTrack: playlist[nextIndex] ?? null,
    previousTrack: playlist[previousIndex] ?? null,
  }
}
