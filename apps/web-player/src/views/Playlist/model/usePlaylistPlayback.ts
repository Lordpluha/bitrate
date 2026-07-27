'use client'

import {
  playPlaylist,
  selectMusicPlayer,
  setPlaylistTracks,
  setShuffleEnabled,
  togglePlay,
} from '@/entities/Player'
import type { TrackEntity } from '@/entities/Track'
import { useAppDispatch, useAppSelector } from '@/shared/hooks'
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
  const dispatch = useAppDispatch()
  const musicPlayer = useAppSelector(selectMusicPlayer)
  const isActive = musicPlayer.currentPlaylistId === playlistId

  const startPlaylist = (
    startTrack: TrackEntity,
    nextTracks: TrackEntity[],
    startTrackIndex: number,
  ) => {
    dispatch(
      playPlaylist({
        currentPlaylistId: playlistId,
        currentPlaylistName: playlistTitle,
        startTrack,
        startTrackIndex,
        tracks: nextTracks,
      }),
    )
  }

  const handlePlayPlaylist = () => {
    const firstTrack = tracks[0]
    if (!firstTrack) return

    if (isActive) {
      dispatch(togglePlay())
      return
    }

    startPlaylist(firstTrack, tracks, 0)
  }

  const handleShufflePlaylist = () => {
    if (tracks.length === 0) return

    if (isActive && musicPlayer.isShuffled) {
      dispatch(setShuffleEnabled(false))
      dispatch(setPlaylistTracks(tracks))
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

    dispatch(setShuffleEnabled(true))
    startPlaylist(startTrack, nextTracks, 0)
  }

  return {
    currentTrackId: musicPlayer.currentTrack?.id,
    handlePlayPlaylist,
    handleShufflePlaylist,
    isActive,
    isPlaying: isActive && musicPlayer.isPlaying,
    isShuffled: isActive && musicPlayer.isShuffled,
    playTrack: (track, index) => startPlaylist(track, tracks, index),
  }
}
