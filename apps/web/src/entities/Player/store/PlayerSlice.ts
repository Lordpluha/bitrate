'use client'

import { createAction, createReducer } from '@reduxjs/toolkit'
import { ITrack } from '@shared/types'

export interface IMusicPlayerState {
  currentTrack: ITrack | null
  playlist: ITrack[]
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  progress: number
}

const initialState: IMusicPlayerState = {
  currentTrack: null,
  playlist: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.5,
  progress: 0,
}

// Actions
export const play = createAction<ITrack>('musicPlayer/play')
export const pause = createAction('musicPlayer/pause')
export const togglePlay = createAction('musicPlayer/togglePlay')
export const setCurrentTime = createAction<number>('musicPlayer/setCurrentTime')
export const setDuration = createAction<number>('musicPlayer/setDuration')
export const setProgress = createAction<number>('musicPlayer/setProgress')
export const setVolume = createAction<number>('musicPlayer/setVolume')
export const setPlaylist = createAction<ITrack[]>('musicPlayer/setPlaylist')
export const changeTrack = createAction<'next' | 'prev'>('musicPlayer/changeTrack')

// Reducer
export const musicPlayerReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(play, (state, action) => {
      state.currentTrack = action.payload
      state.isPlaying = true
      state.currentTime = 0
      state.duration = action.payload.duration || 0
    })
    .addCase(pause, (state) => {
      state.isPlaying = false
    })
    .addCase(togglePlay, (state) => {
      state.isPlaying = !state.isPlaying
    })
    .addCase(setCurrentTime, (state, action) => {
      state.currentTime = action.payload
    })
    .addCase(setDuration, (state, action) => {
      state.duration = action.payload
    })
    .addCase(setProgress, (state, action) => {
      state.progress = action.payload
    })
    .addCase(setVolume, (state, action) => {
      state.volume = action.payload
    })
    .addCase(setPlaylist, (state, action) => {
      state.playlist = action.payload
    })
    .addCase(changeTrack, (state, action) => {
      if (!state.currentTrack || state.playlist.length === 0) return
      
      const currentIndex = state.playlist.findIndex(
        track => (track as ITrack).id === (state.currentTrack as ITrack)?.id
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
    })
})

// Selectors
export const selectMusicPlayer = (state: { musicPlayer: IMusicPlayerState }) => state.musicPlayer
export const selectCurrentTrack = (state: { musicPlayer: IMusicPlayerState }) => state.musicPlayer.currentTrack
export const selectPlaylist = (state: { musicPlayer: IMusicPlayerState }) => state.musicPlayer.playlist
export const selectIsPlaying = (state: { musicPlayer: IMusicPlayerState }) => state.musicPlayer.isPlaying
export const selectCurrentTime = (state: { musicPlayer: IMusicPlayerState }) => state.musicPlayer.currentTime
export const selectDuration = (state: { musicPlayer: IMusicPlayerState }) => state.musicPlayer.duration
export const selectVolume = (state: { musicPlayer: IMusicPlayerState }) => state.musicPlayer.volume
export const selectProgress = (state: { musicPlayer: IMusicPlayerState }) => state.musicPlayer.progress
