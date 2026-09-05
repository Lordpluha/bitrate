import type { StateCreator } from 'zustand'
import type { PlayerState } from './playerStore.types'
import {
  createQueuedTrack,
  getTrackChange,
  getTransitionState,
  initialPlayerState,
  repeatOrder,
  resolvePlaybackTransition,
} from './playerStore.utils'

export const createPlayerState: StateCreator<PlayerState, [], []> = (
  set,
  get,
) => ({
  ...initialPlayerState,
  play: (track) =>
    set((state) => ({
      currentPlaylistId: null,
      currentPlaylistName: null,
      currentQueueId: null,
      currentTime: 0,
      currentTrack: track,
      currentTrackIndex: state.playlist.findIndex(
        (item) => item.id === track.id,
      ),
      duration: track.duration ?? 0,
      isPlaying: true,
      playbackSequence: state.playbackSequence + 1,
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
      startTrackIndex ?? tracks.findIndex((track) => track.id === startTrack.id)
    set((state) => ({
      currentPlaylistId,
      currentPlaylistName,
      currentQueueId: null,
      currentTime: 0,
      currentTrack: startTrack,
      currentTrackIndex: resolvedIndex >= 0 ? resolvedIndex : 0,
      duration: startTrack.duration ?? 0,
      isPlaying: true,
      playbackSequence: state.playbackSequence + 1,
      playlist: tracks,
      progress: 0,
    }))
  },
  pause: () => set({ isPlaying: false }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setProgress: (progress) => set({ progress }),
  setVolume: (volume) => set({ volume }),
  setPlaylistTracks: (playlist) =>
    set((state) => {
      const contextTrack = state.currentQueueId
        ? state.playlist[state.currentTrackIndex]
        : state.currentTrack

      return {
        currentTrackIndex: contextTrack
          ? playlist.findIndex((track) => track.id === contextTrack.id)
          : -1,
        playlist,
      }
    }),
  setCurrentPlaylistName: (currentPlaylistName) => set({ currentPlaylistName }),
  setShuffleEnabled: (isShuffled) => set({ isShuffled }),
  setRepeatMode: (repeatMode) => set({ repeatMode }),
  cycleRepeatMode: () =>
    set((state) => {
      const nextIndex =
        (repeatOrder.indexOf(state.repeatMode) + 1) % repeatOrder.length
      return { repeatMode: repeatOrder[nextIndex] ?? 'off' }
    }),
  addToQueue: (track) =>
    set((state) => ({ queue: [...state.queue, createQueuedTrack(track)] })),
  playNext: (track) =>
    set((state) => ({ queue: [createQueuedTrack(track), ...state.queue] })),
  removeFromQueue: (queueId) =>
    set((state) => ({
      queue: state.queue.filter((item) => item.queueId !== queueId),
    })),
  clearQueue: () => set({ queue: [] }),
  restorePlayerSession: (session) =>
    set({
      currentPlaylistId: session.currentPlaylistId ?? null,
      currentPlaylistName: session.currentPlaylistName ?? null,
      currentQueueId: session.currentQueueId ?? null,
      currentTime: session.currentTime ?? 0,
      currentTrack: session.currentTrack ?? null,
      currentTrackIndex: session.currentTrackIndex ?? -1,
      duration: session.duration ?? session.currentTrack?.duration ?? 0,
      isPlaying: false,
      isShuffled: session.isShuffled ?? get().isShuffled,
      playbackSequence: session.playbackSequence ?? get().playbackSequence + 1,
      playlist: session.playlist ?? [],
      progress: session.progress ?? 0,
      queue: session.queue ?? [],
      repeatMode: session.repeatMode ?? get().repeatMode,
      volume: session.volume ?? get().volume,
    }),
  advanceOnTrackEnd: () => {
    const transition = resolvePlaybackTransition(get(), 'next', 'ended')
    if (transition) set(getTransitionState(transition))
  },
  changeTrack: (direction) => {
    const nextState = getTrackChange(get(), direction)
    if (nextState) set(nextState)
  },
  reset: () => set(initialPlayerState),
})
