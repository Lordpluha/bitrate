'use client'

import { createPersistedStore, registerStoreReset } from '@/shared/store'
import { createPlayerState } from './playerStore.actions'
import type { PlayerState } from './playerStore.types'

export type {
  PlayerSnapshot,
  PlayerState,
  RepeatMode,
} from './playerStore.types'
export {
  type PlaybackTransition,
  resolvePlaybackTransition,
} from './playerStore.utils'

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
export const selectCurrentQueueId = (state: PlayerState) => state.currentQueueId
export const selectIsPlaying = (state: PlayerState) => state.isPlaying
export const selectPlaybackSequence = (state: PlayerState) =>
  state.playbackSequence
export const selectRepeatMode = (state: PlayerState) => state.repeatMode
export const selectQueue = (state: PlayerState) => state.queue
export const selectVolume = (state: PlayerState) => state.volume
