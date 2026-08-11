'use client'

import { createPersistedStore, registerStoreReset } from '@/shared/store'
import { createPlayerState } from './playerStore.actions'
import type { PlayerState } from './playerStore.types'

export type {
  PlayerSnapshot,
  PlayerState,
  PlayPlaylistInput,
  RepeatMode,
} from './playerStore.types'

export const usePlayerStore = createPersistedStore<PlayerState>({
  initializer: createPlayerState,
  name: 'player',
})

registerStoreReset({ reset: () => usePlayerStore.getState().reset() })

export const selectMusicPlayer = (state: PlayerState) => state
export const selectCurrentTrack = (state: PlayerState) => state.currentTrack
export const selectCurrentTrackIndex = (state: PlayerState) =>
  state.currentTrackIndex
export const selectPlaylist = (state: PlayerState) => state.playlist
export const selectCurrentPlaylistId = (state: PlayerState) =>
  state.currentPlaylistId
export const selectCurrentPlaylistName = (state: PlayerState) =>
  state.currentPlaylistName
export const selectIsPlaying = (state: PlayerState) => state.isPlaying
export const selectCurrentTime = (state: PlayerState) => state.currentTime
export const selectDuration = (state: PlayerState) => state.duration
export const selectIsShuffled = (state: PlayerState) => state.isShuffled
export const selectRepeatMode = (state: PlayerState) => state.repeatMode
export const selectQueue = (state: PlayerState) => state.queue
export const selectVolume = (state: PlayerState) => state.volume
export const selectProgress = (state: PlayerState) => state.progress
