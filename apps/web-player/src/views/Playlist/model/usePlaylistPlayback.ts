'use client'

import { selectMusicPlayer, usePlayerStore } from '@/entities/Player'
import type { TrackEntity } from '@/entities/Track'
import { showApiSuccessToast } from '@/shared/api/feedback'
import { useI18n } from '@/shared/i18n'
import type { PlaylistPlayback } from '@/views/Playlist/model/playlist.types'
import { shuffleTracks } from '@/views/Playlist/model/playlist.utils'

type UsePlaylistPlaybackOptions = {
  playlistId: string
  playlistTitle: string
  tracks: TrackEntity[]
}

export const usePlaylistPlayback = ({
  playlistId,
  playlistTitle,
  tracks,
}: UsePlaylistPlaybackOptions): PlaylistPlayback => {
  const { tp } = useI18n()
  const musicPlayer = usePlayerStore(selectMusicPlayer)
  const playPlaylist = usePlayerStore((state) => state.playPlaylist)
  const togglePlay = usePlayerStore((state) => state.togglePlay)
  const setPlaylistTracks = usePlayerStore((state) => state.setPlaylistTracks)
  const setShuffleEnabled = usePlayerStore((state) => state.setShuffleEnabled)
  const addToQueue = usePlayerStore((state) => state.addToQueue)
  const isActive = musicPlayer.currentPlaylistId === playlistId

  const startPlaylist = (
    startTrack: TrackEntity,
    nextTracks: TrackEntity[],
    startTrackIndex: number,
  ) => {
    playPlaylist({
      currentPlaylistId: playlistId,
      currentPlaylistName: playlistTitle,
      startTrack,
      startTrackIndex,
      tracks: nextTracks,
    })
  }

  const handlePlayPlaylist = () => {
    const firstTrack = tracks[0]
    if (!firstTrack) return

    if (isActive) {
      togglePlay()
      return
    }

    startPlaylist(firstTrack, tracks, 0)
  }

  const handleShufflePlaylist = () => {
    if (tracks.length === 0) return

    if (isActive && musicPlayer.isShuffled) {
      setShuffleEnabled(false)
      setPlaylistTracks(tracks)
      return
    }

    const activeTrack = isActive ? musicPlayer.currentTrack : null
    const remainingTracks = tracks.filter(
      (track) => track.id !== activeTrack?.id,
    )
    const shuffledTracks = shuffleTracks(remainingTracks)
    const nextTracks = activeTrack
      ? [activeTrack, ...shuffledTracks]
      : shuffledTracks
    const startTrack = activeTrack ?? nextTracks[0]
    if (!startTrack) return

    setShuffleEnabled(true)
    startPlaylist(startTrack, nextTracks, 0)
  }

  const handleAddToQueue = () => {
    if (tracks.length === 0) return
    for (const track of tracks) addToQueue(track)
    showApiSuccessToast(tp({ count: tracks.length, key: 'queue.addedTracks' }))
  }

  return {
    currentTrackId: musicPlayer.currentTrack?.id,
    handleAddToQueue,
    handlePlayPlaylist,
    handleShufflePlaylist,
    isActive,
    isPlaying: isActive && musicPlayer.isPlaying,
    isShuffled: isActive && musicPlayer.isShuffled,
    playTrack: (track, index) => startPlaylist(track, tracks, index),
  }
}
