'use client'

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ITrack } from '@shared/types'

export interface MusicPlayerState {
  currentTrack: ITrack | null
  playlist: ITrack[]
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  progress: number
}

const initialState: MusicPlayerState = {
  currentTrack: null,
  playlist: [],
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
    play: create.reducer<ITrack>((state, action) => {
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
    setPlaylist: create.reducer<ITrack[]>((state, action) => {
      state.playlist = action.payload
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
  setPlaylist,
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
  selectProgress,
  selectVolume,
} = musicPlayerSlice.selectors
