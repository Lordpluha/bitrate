'use client'

import type { ApiSchemas } from '@spotify/contracts'
import { createPersistedStore, registerStoreReset } from '@/shared/store'

type TrackDirection = 'next' | 'prev'
type PlayerTrack = ApiSchemas['TrackEntity']

export type PlayPlaylistInput = {
  currentPlaylistId: string | null
  currentPlaylistName: string | null
  startTrack: PlayerTrack
  startTrackIndex?: number
  tracks: PlayerTrack[]
}

export type PlayerState = {
  currentTrack: PlayerTrack | null
  currentTrackIndex: number
  playlist: PlayerTrack[]
  currentPlaylistId: string | null
  currentPlaylistName: string | null
  isPlaying: boolean
  currentTime: number
  duration: number
  isShuffled: boolean
  volume: number
  progress: number
  play: (track: PlayerTrack) => void
  playPlaylist: (input: PlayPlaylistInput) => void
  pause: () => void
  setIsPlaying: (isPlaying: boolean) => void
  togglePlay: () => void
  setCurrentTime: (currentTime: number) => void
  setDuration: (duration: number) => void
  setProgress: (progress: number) => void
  setVolume: (volume: number) => void
  setPlaylistTracks: (playlist: PlayerTrack[]) => void
  setCurrentPlaylistName: (name: string | null) => void
  setShuffleEnabled: (isShuffled: boolean) => void
  restorePlayerSession: (session: Partial<PlayerSnapshot>) => void
  changeTrack: (direction: TrackDirection) => void
  reset: () => void
}

export type PlayerSnapshot = Pick<
  PlayerState,
  | 'currentTrack'
  | 'currentTrackIndex'
  | 'playlist'
  | 'currentPlaylistId'
  | 'currentPlaylistName'
  | 'isPlaying'
  | 'currentTime'
  | 'duration'
  | 'isShuffled'
  | 'volume'
  | 'progress'
>

const initialPlayerState: PlayerSnapshot = {
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

/** Resolves the current track's index, falling back to a lookup when it's stale. */
const resolveCurrentIndex = (
  playlist: PlayerTrack[],
  currentTrack: PlayerTrack,
  currentTrackIndex: number,
) => {
  if (
    currentTrackIndex >= 0 &&
    currentTrackIndex < playlist.length &&
    playlist[currentTrackIndex]?.id === currentTrack.id
  ) {
    return currentTrackIndex
  }
  return playlist.findIndex((track) => track.id === currentTrack.id)
}

export const usePlayerStore = createPersistedStore<PlayerState>({
  name: 'player',
  initializer: (set, get) => ({
    ...initialPlayerState,
    play: (track) =>
      set((state) => ({
        currentTrack: track,
        currentTrackIndex: state.playlist.findIndex((t) => t.id === track.id),
        currentPlaylistId: null,
        currentPlaylistName: null,
        isPlaying: true,
        currentTime: 0,
        duration: track.duration ?? 0,
        progress: 0,
      })),
    playPlaylist: ({
      currentPlaylistId,
      currentPlaylistName,
      startTrack,
      startTrackIndex,
      tracks,
    }) => {
      const resolvedIndex =
        startTrackIndex ??
        tracks.findIndex((track) => track.id === startTrack.id)
      set({
        playlist: tracks,
        currentPlaylistId,
        currentPlaylistName,
        currentTrack: startTrack,
        currentTrackIndex: resolvedIndex >= 0 ? resolvedIndex : 0,
        isPlaying: true,
        currentTime: 0,
        duration: startTrack.duration ?? 0,
        progress: 0,
      })
    },
    pause: () => set({ isPlaying: false }),
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
    setCurrentTime: (currentTime) => set({ currentTime }),
    setDuration: (duration) => set({ duration }),
    setProgress: (progress) => set({ progress }),
    setVolume: (volume) => set({ volume }),
    setPlaylistTracks: (playlist) =>
      set((state) => ({
        playlist,
        currentTrackIndex: state.currentTrack
          ? playlist.findIndex((track) => track.id === state.currentTrack?.id)
          : -1,
      })),
    setCurrentPlaylistName: (currentPlaylistName) =>
      set({ currentPlaylistName }),
    setShuffleEnabled: (isShuffled) => set({ isShuffled }),
    restorePlayerSession: (session) =>
      set({
        currentTrack: session.currentTrack ?? null,
        currentTrackIndex: session.currentTrackIndex ?? -1,
        playlist: session.playlist ?? [],
        currentPlaylistId: session.currentPlaylistId ?? null,
        currentPlaylistName: session.currentPlaylistName ?? null,
        currentTime: session.currentTime ?? 0,
        duration: session.duration ?? session.currentTrack?.duration ?? 0,
        volume: session.volume ?? get().volume,
        progress: session.progress ?? 0,
        isPlaying: false,
      }),
    changeTrack: (direction) => {
      const { currentTrack, playlist, currentTrackIndex } = get()
      if (!currentTrack || playlist.length === 0) return

      const index = resolveCurrentIndex(
        playlist,
        currentTrack,
        currentTrackIndex,
      )
      if (index === -1) return

      const nextIndex =
        direction === 'next'
          ? (index + 1) % playlist.length
          : index === 0
            ? playlist.length - 1
            : index - 1
      const nextTrack = playlist[nextIndex]
      if (!nextTrack) return

      set({
        currentTrack: nextTrack,
        currentTrackIndex: nextIndex,
        isPlaying: true,
        currentTime: 0,
        duration: nextTrack.duration ?? 0,
        progress: 0,
      })
    },
    reset: () => set(initialPlayerState),
  }),
})

registerStoreReset({
  reset: () => usePlayerStore.getState().reset(),
})

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
export const selectVolume = (state: PlayerState) => state.volume
export const selectProgress = (state: PlayerState) => state.progress
