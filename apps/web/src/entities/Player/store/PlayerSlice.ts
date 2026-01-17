'use client'

import { PayloadAction } from '@reduxjs/toolkit'
import { createAppSlice } from '@shared/store/createAppSlice'
import { ITrack, IMusicPlayerState } from '@shared/types'

const initialState: IMusicPlayerState = {
  currentTrack: null,
  playlist: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.5,
  progress: 0,
}

export const musicPlayerSlice = createAppSlice({
  name: 'musicPlayer',
  initialState,
  reducers: {
    play: (state, action: PayloadAction<ITrack>) => {
      state.currentTrack = action.payload
      state.isPlaying = true
      state.currentTime = 0
      state.duration = action.payload.duration || 0
    },
    pause: (state) => {
      state.isPlaying = false
    },
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload
    },
    setPlaylist: (state, action: PayloadAction<ITrack[]>) => {
      state.playlist = action.payload
    },
    changeTrack: (state, action: PayloadAction<'next' | 'prev'>) => {
      if (!state.currentTrack || state.playlist.length === 0) return
      
      const currentIndex = state.playlist.findIndex(
        track => track.id === state.currentTrack?.id
      )
      
      if (currentIndex === -1) return
      
      let newIndex: number
      if (action.payload === 'next') {
        newIndex = (currentIndex + 1) % state.playlist.length
      } else {
        newIndex = currentIndex === 0 ? state.playlist.length - 1 : currentIndex - 1
      }
      
      state.currentTrack = state.playlist[newIndex] ?? null
      state.isPlaying = true
      state.currentTime = 0
      state.duration = state.playlist[newIndex]?.duration || 0
    },
  },
})

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

// Selectors
export const selectCurrentTrack = (state: { musicPlayer: IMusicPlayerState }) => state.musicPlayer.currentTrack
export const selectPlaylist = (state: { musicPlayer: IMusicPlayerState }) => state.musicPlayer.playlist
export const selectIsPlaying = (state: { musicPlayer: IMusicPlayerState }) => state.musicPlayer.isPlaying
export const selectCurrentTime = (state: { musicPlayer: IMusicPlayerState }) => state.musicPlayer.currentTime
export const selectDuration = (state: { musicPlayer: IMusicPlayerState }) => state.musicPlayer.duration
export const selectVolume = (state: { musicPlayer: IMusicPlayerState }) => state.musicPlayer.volume
export const selectProgress = (state: { musicPlayer: IMusicPlayerState }) => state.musicPlayer.progress

export default musicPlayerSlice.reducer
