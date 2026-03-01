'use client'

import { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { createSlice } from '@reduxjs/toolkit'

export interface MusicPlayerState {
  currentTrack: TrackEntity | null
  playlist: TrackEntity[]
  currentPlaylistName: string | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  progress: number
}

const initialState: MusicPlayerState = {
  currentTrack: null,
  playlist: [],
  currentPlaylistName: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.5,
  progress: 0,
}

const musicPlayerSlice = createSlice({
  name: 'musicPlayer',
  initialState,
  reducers: (create) => ({
    play: create.reducer<TrackEntity>((state, action) => {
      state.currentTrack = action.payload
      state.isPlaying = true
      state.currentTime = 0
      state.duration = action.payload.duration || 0
    }),
    pause: create.reducer((state) => {
      state.isPlaying = false
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
    }),
    setCurrentPlaylistName: create.reducer<string | null>((state, action) => {
      state.currentPlaylistName = action.payload
    }),
    changeTrack: create.reducer<'next' | 'prev'>((state, action) => {
      if (!state.currentTrack || state.playlist.length === 0) return

      const currentIndex = state.playlist.findIndex(
        (track) => track.id === state.currentTrack?.id,
      )

      if (currentIndex === -1) return

      let newIndex: number
      if (action.payload === 'next') {
        newIndex = (currentIndex + 1) % state.playlist.length
      } else {
        newIndex =
          currentIndex === 0 ? state.playlist.length - 1 : currentIndex - 1
      }

      state.currentTrack = state.playlist[newIndex] ?? null
      state.isPlaying = true
      state.currentTime = 0
      state.duration = state.playlist[newIndex]?.duration || 0
    }),
  }),
  selectors: {
    selectMusicPlayer: (state) => state,
    selectCurrentTrack: (state) => state.currentTrack,
    selectPlaylist: (state) => state.playlist,
    selectCurrentPlaylistName: (state) => state.currentPlaylistName,
    selectIsPlaying: (state) => state.isPlaying,
    selectCurrentTime: (state) => state.currentTime,
    selectDuration: (state) => state.duration,
    selectVolume: (state) => state.volume,
    selectProgress: (state) => state.progress,
  },
})

// Actions
export const {
  play,
  pause,
  togglePlay,
  setCurrentTime,
  setDuration,
  setProgress,
  setVolume,
  setPlaylistTracks,
  setCurrentPlaylistName,
  changeTrack,
} = musicPlayerSlice.actions

// Reducer
export const musicPlayerReducer = musicPlayerSlice.reducer

export const {
  selectCurrentTime,
  selectCurrentTrack,
  selectDuration,
  selectIsPlaying,
  selectMusicPlayer,
  selectPlaylist,
  selectCurrentPlaylistName,
  selectProgress,
  selectVolume,
} = musicPlayerSlice.selectors
