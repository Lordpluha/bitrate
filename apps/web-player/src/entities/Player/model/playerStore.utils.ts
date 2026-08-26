import type {
  PlayerSnapshot,
  PlayerState,
  PlayerTrack,
  QueuedTrack,
  RepeatMode,
} from './playerStore.types'

export const repeatOrder: RepeatMode[] = ['off', 'all', 'one']

export const initialPlayerState: PlayerSnapshot = {
  currentPlaylistId: null,
  currentPlaylistName: null,
  currentQueueId: null,
  currentTime: 0,
  currentTrack: null,
  currentTrackIndex: -1,
  duration: 0,
  isPlaying: false,
  isShuffled: false,
  playbackSequence: 0,
  playlist: [],
  progress: 0,
  queue: [],
  repeatMode: 'off',
  volume: 0.5,
}

export const createQueuedTrack = (track: PlayerTrack): QueuedTrack => ({
  queueId: `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  track,
})

export const resolveCurrentIndex = (
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

type TrackChangeState = Pick<
  PlayerState,
  | 'currentTrack'
  | 'currentTrackIndex'
  | 'currentQueueId'
  | 'currentTime'
  | 'duration'
  | 'isPlaying'
  | 'playbackSequence'
  | 'progress'
  | 'queue'
>

export type PlaybackTransition =
  | {
      kind: 'restart'
    }
  | {
      kind: 'stop'
    }
  | {
      currentTrackIndex: number
      currentQueueId: string | null
      kind: 'track'
      playbackSequence: number
      queue: QueuedTrack[]
      track: PlayerTrack
    }

type PlaybackTransitionReason = 'ended' | 'manual'

type PlaybackTransitionState = Pick<
  PlayerSnapshot,
  | 'currentTrack'
  | 'currentTrackIndex'
  | 'currentQueueId'
  | 'playbackSequence'
  | 'playlist'
  | 'queue'
  | 'repeatMode'
>

const isPlaylistIndex = (playlist: PlayerTrack[], index: number) =>
  index >= 0 && index < playlist.length

/**
 * Resolves the exact action that playback, prefetch and navigation previews must
 * agree on. While an ad-hoc queue item is playing, `currentTrackIndex` remains
 * the cursor in the original playlist so playback can resume afterwards.
 */
export const resolvePlaybackTransition = (
  state: PlaybackTransitionState,
  direction: 'next' | 'prev',
  reason: PlaybackTransitionReason = 'manual',
): PlaybackTransition | null => {
  const {
    currentTrack,
    currentTrackIndex,
    currentQueueId,
    playbackSequence,
    playlist,
    queue,
    repeatMode,
  } = state
  if (!currentTrack) return null

  if (direction === 'next' && reason === 'ended' && repeatMode === 'one') {
    return { kind: 'restart' }
  }

  const queuedNext = queue[0]
  if (direction === 'next' && queuedNext) {
    const playlistIndex = currentQueueId
      ? isPlaylistIndex(playlist, currentTrackIndex)
        ? currentTrackIndex
        : -1
      : resolveCurrentIndex(playlist, currentTrack, currentTrackIndex)

    return {
      currentTrackIndex: playlistIndex,
      currentQueueId: queuedNext.queueId,
      kind: 'track',
      playbackSequence: playbackSequence + 1,
      queue: queue.slice(1),
      track: queuedNext.track,
    }
  }

  const currentTrackIsAtCursor =
    isPlaylistIndex(playlist, currentTrackIndex) &&
    playlist[currentTrackIndex]?.id === currentTrack.id
  const contextIndex = currentQueueId
    ? isPlaylistIndex(playlist, currentTrackIndex)
      ? currentTrackIndex
      : -1
    : resolveCurrentIndex(playlist, currentTrack, currentTrackIndex)

  if (playlist.length === 0 || contextIndex === -1) return null

  if (direction === 'next') {
    if (contextIndex === playlist.length - 1 && repeatMode === 'off') {
      return { kind: 'stop' }
    }

    const nextIndex = (contextIndex + 1) % playlist.length
    const nextTrack = playlist[nextIndex]
    if (!nextTrack) return null

    return {
      currentTrackIndex: nextIndex,
      currentQueueId: null,
      kind: 'track',
      playbackSequence: playbackSequence + 1,
      queue,
      track: nextTrack,
    }
  }

  /** Previous from a queue item returns to the playlist track it interrupted. */
  const previousIndex = currentTrackIsAtCursor
    ? contextIndex === 0
      ? playlist.length - 1
      : contextIndex - 1
    : contextIndex
  const previousTrack = playlist[previousIndex]
  if (!previousTrack) return null

  return {
    currentTrackIndex: previousIndex,
    currentQueueId: null,
    kind: 'track',
    playbackSequence: playbackSequence + 1,
    queue,
    track: previousTrack,
  }
}

export const getTransitionState = (
  transition: PlaybackTransition,
): Partial<TrackChangeState> => {
  if (transition.kind === 'restart') {
    return { currentTime: 0, isPlaying: true, progress: 0 }
  }

  if (transition.kind === 'stop') {
    return { currentTime: 0, isPlaying: false, progress: 0 }
  }

  return {
    currentTime: 0,
    currentTrack: transition.track,
    currentTrackIndex: transition.currentTrackIndex,
    currentQueueId: transition.currentQueueId,
    duration: transition.track.duration ?? 0,
    isPlaying: true,
    playbackSequence: transition.playbackSequence,
    progress: 0,
    queue: transition.queue,
  }
}

export const getTrackChange = (
  state: PlayerState,
  direction: 'next' | 'prev',
): Partial<TrackChangeState> | null => {
  const transition = resolvePlaybackTransition(state, direction)
  return transition ? getTransitionState(transition) : null
}
