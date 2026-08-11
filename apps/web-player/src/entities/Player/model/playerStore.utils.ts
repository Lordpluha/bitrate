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
  currentTime: 0,
  currentTrack: null,
  currentTrackIndex: -1,
  duration: 0,
  isPlaying: false,
  isShuffled: false,
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
  | 'currentTime'
  | 'duration'
  | 'isPlaying'
  | 'progress'
  | 'queue'
>

export const getTrackChange = (
  state: PlayerState,
  direction: 'next' | 'prev',
): Partial<TrackChangeState> | null => {
  const { currentTrack, currentTrackIndex, playlist, queue, repeatMode } = state
  if (!currentTrack) return null

  const queuedNext = queue[0]
  if (direction === 'next' && queuedNext) {
    return {
      currentTime: 0,
      currentTrack: queuedNext.track,
      currentTrackIndex: resolveCurrentIndex(playlist, queuedNext.track, -1),
      duration: queuedNext.track.duration ?? 0,
      isPlaying: true,
      progress: 0,
      queue: queue.slice(1),
    }
  }

  const index = resolveCurrentIndex(playlist, currentTrack, currentTrackIndex)
  if (playlist.length === 0 || index === -1) return null

  if (
    direction === 'next' &&
    index === playlist.length - 1 &&
    repeatMode === 'off'
  ) {
    return { currentTime: 0, isPlaying: false, progress: 0 }
  }

  const nextIndex =
    direction === 'next'
      ? (index + 1) % playlist.length
      : index === 0
        ? playlist.length - 1
        : index - 1
  const nextTrack = playlist[nextIndex]
  if (!nextTrack) return null

  return {
    currentTime: 0,
    currentTrack: nextTrack,
    currentTrackIndex: nextIndex,
    duration: nextTrack.duration ?? 0,
    isPlaying: true,
    progress: 0,
  }
}
