'use client'

import {
  type PlayerState,
  selectCurrentTrack,
  selectCurrentTrackIndex,
  selectPlaylist,
  usePlayerStore,
} from '@/entities/Player'

interface PlayerNavigationTracks {
  nextTrack: PlayerState['currentTrack']
  previousTrack: PlayerState['currentTrack']
}

export const usePlayerNavigationTracks = (): PlayerNavigationTracks => {
  const currentTrack = usePlayerStore(selectCurrentTrack)
  const currentTrackIndex = usePlayerStore(selectCurrentTrackIndex)
  const playlist = usePlayerStore(selectPlaylist)

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
