'use client'

import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { createSlice } from '@reduxjs/toolkit'

export interface MusicPlayerState {
  currentTrack: TrackEntity | null
  currentTrackIndex: number
  playlist: TrackEntity[]
  currentPlaylistId: string | null
  currentPlaylistName: string | null
  isPlaying: boolean
  currentTime: number
  duration: number
  isShuffled: boolean
  volume: number
  progress: number
}

const initialState: MusicPlayerState = {
  currentTrack: null,
  currentTrackIndex: -1,
  playlist: [],
  currentPlaylistId: null,
  currentPlaylistName: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  isShuffled: false,
  volume: 0.5,
  progress: 0,
}

const musicPlayerSlice = createSlice({
  name: 'musicPlayer',
  initialState,
  reducers: (create) => ({
    play: create.reducer<TrackEntity>((state, action) => {
      state.currentTrack = action.payload
      state.currentTrackIndex = 0
      state.playlist = [action.payload]
      state.currentPlaylistId = null
      state.currentPlaylistName = null
      state.isPlaying = true
      state.currentTime = 0
      state.duration = action.payload.duration || 0
    }),
    pause: create.reducer((state) => {
      state.isPlaying = false
    }),
    setIsPlaying: create.reducer<boolean>((state, action) => {
      state.isPlaying = action.payload
    }),
    togglePlay: create.reducer((state) => {
      state.isPlaying = !state.isPlaying
    }),
    setCurrentTime: create.reducer<number>((state, action) => {
      state.currentTime = action.payload
    }),
    setDuration: create.reducer<number>((state, action) => {
      state.duration = action.payload
    }),
    setProgress: create.reducer<number>((state, action) => {
      state.progress = action.payload
    }),
    setVolume: create.reducer<number>((state, action) => {
      state.volume = action.payload
    }),
    setPlaylistTracks: create.reducer<TrackEntity[]>((state, action) => {
      state.playlist = action.payload
      state.currentTrackIndex = state.currentTrack
        ? action.payload.findIndex(
            (track) => track.id === state.currentTrack?.id,
          )
        : -1
    }),
    setCurrentPlaylistName: create.reducer<string | null>((state, action) => {
      state.currentPlaylistName = action.payload
    }),
    setShuffleEnabled: create.reducer<boolean>((state, action) => {
      state.isShuffled = action.payload
    }),
    playPlaylist: create.reducer<{
      currentPlaylistId: string | null
      currentPlaylistName: string | null
      startTrack: TrackEntity
      startTrackIndex?: number
      tracks: TrackEntity[]
    }>((state, action) => {
      state.playlist = action.payload.tracks
      state.currentPlaylistId = action.payload.currentPlaylistId
      state.currentPlaylistName = action.payload.currentPlaylistName
      state.currentTrack = action.payload.startTrack
      const startTrackIndex =
        action.payload.startTrackIndex ??
        action.payload.tracks.findIndex(
          (track) => track.id === action.payload.startTrack.id,
        )
      state.currentTrackIndex = startTrackIndex >= 0 ? startTrackIndex : 0
      state.isPlaying = true
      state.currentTime = 0
      state.duration = action.payload.startTrack.duration || 0
    }),
    restorePlayerSession: create.reducer<Partial<MusicPlayerState>>(
      (state, action) => {
        state.currentTrack = action.payload.currentTrack ?? null
        state.currentTrackIndex = action.payload.currentTrackIndex ?? -1
        state.playlist = action.payload.playlist ?? []
        state.currentPlaylistId = action.payload.currentPlaylistId ?? null
        state.currentPlaylistName = action.payload.currentPlaylistName ?? null
        state.currentTime = action.payload.currentTime ?? 0
        state.duration =
          action.payload.duration ?? action.payload.currentTrack?.duration ?? 0
        state.volume = action.payload.volume ?? state.volume
        state.progress = action.payload.progress ?? 0
        state.isPlaying = false
      },
    ),
    changeTrack: create.reducer<'next' | 'prev'>((state, action) => {
      if (!state.currentTrack || state.playlist.length === 0) return

      const currentIndex = state.currentTrackIndex

      if (
        currentIndex < 0 ||
        currentIndex >= state.playlist.length ||
        state.playlist[currentIndex]?.id !== state.currentTrack.id
      ) {
        const fallbackIndex = state.playlist.findIndex(
          (track) => track.id === state.currentTrack?.id,
        )
        if (fallbackIndex === -1) return
        state.currentTrackIndex = fallbackIndex
      }

      let newIndex: number
      const nextCurrentIndex = state.currentTrackIndex
      if (action.payload === 'next') {
        newIndex = (nextCurrentIndex + 1) % state.playlist.length
      } else {
        newIndex =
          nextCurrentIndex === 0
            ? state.playlist.length - 1
            : nextCurrentIndex - 1
      }

      state.currentTrack = state.playlist[newIndex] ?? null
      state.currentTrackIndex = newIndex
      state.isPlaying = true
      state.currentTime = 0
      state.duration = state.playlist[newIndex]?.duration || 0
    }),
  }),
  selectors: {
    selectMusicPlayer: (state) => state,
    selectCurrentTrack: (state) => state.currentTrack,
    selectCurrentTrackIndex: (state) => state.currentTrackIndex,
    selectPlaylist: (state) => state.playlist,
    selectCurrentPlaylistId: (state) => state.currentPlaylistId,
    selectCurrentPlaylistName: (state) => state.currentPlaylistName,
    selectIsPlaying: (state) => state.isPlaying,
    selectCurrentTime: (state) => state.currentTime,
    selectDuration: (state) => state.duration,
    selectIsShuffled: (state) => state.isShuffled,
    selectVolume: (state) => state.volume,
    selectProgress: (state) => state.progress,
  },
})

// Actions
export const {
  play,
  playPlaylist,
  pause,
  setIsPlaying,
  togglePlay,
  setCurrentTime,
  setDuration,
  setProgress,
  setVolume,
  setPlaylistTracks,
  setCurrentPlaylistName,
  setShuffleEnabled,
  restorePlayerSession,
  changeTrack,
} = musicPlayerSlice.actions

// Reducer
export const musicPlayerReducer = musicPlayerSlice.reducer

export const {
  selectCurrentTime,
  selectCurrentTrack,
  selectCurrentTrackIndex,
  selectDuration,
  selectIsShuffled,
  selectIsPlaying,
  selectMusicPlayer,
  selectPlaylist,
  selectCurrentPlaylistId,
  selectCurrentPlaylistName,
  selectProgress,
  selectVolume,
} = musicPlayerSlice.selectors
