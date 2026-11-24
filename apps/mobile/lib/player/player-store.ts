import { create } from 'zustand'

import type { PlayableTrack, QueueSource } from '@/lib/catalog/playable-track'

import { audioEngine } from './engine'
import type { EngineState } from './engine/audio-engine'
import { openStream } from './open-stream'
import { type PlaybackErrorKind, toPlaybackErrorKind } from './playback-error'

type PlayerStatus = 'idle' | 'loading' | 'buffering' | 'playing' | 'paused' | 'error'

/** "Previous" restarts the current track instead once it has played this long. */
const RESTART_THRESHOLD_SEC = 3

type PlayQueueInput = {
  tracks: PlayableTrack[]
  startIndex: number
  source: QueueSource
}

type PlayerState = {
  queue: PlayableTrack[]
  index: number
  source: QueueSource | null
  status: PlayerStatus
  error: PlaybackErrorKind | null
  current: () => PlayableTrack | null
  playQueue: (input: PlayQueueInput) => void
  togglePlay: () => Promise<void>
  next: () => void
  previous: () => Promise<void>
  seekTo: (positionSec: number) => Promise<void>
  stop: () => void
  handleTrackEnded: () => void
  handleEngineState: (state: EngineState) => void
}

/** Bumped on every new selection so a slow play-session response cannot start a stale track. */
let loadGeneration = 0

/**
 * The listening session: queue, position in it and playback status. Server data stays in React
 * Query; this store only holds what the player itself owns.
 */
export const usePlayerStore = create<PlayerState>()((set, get) => {
  async function loadAt(index: number) {
    const track = get().queue[index]
    if (!track) return
    const generation = ++loadGeneration
    set({ index, status: 'loading', error: null })

    try {
      const stream = await openStream(track.id)
      if (generation !== loadGeneration) return
      await audioEngine.load({
        id: track.id,
        url: stream.url,
        title: track.title,
        artist: track.artistName ?? '',
        artworkUrl: track.coverUrl,
        durationSec: stream.durationSec,
      })
      if (generation !== loadGeneration) return
      await audioEngine.play()
    } catch (error) {
      if (generation !== loadGeneration) return
      set({ status: 'error', error: toPlaybackErrorKind(error) })
    }
  }

  return {
    queue: [],
    index: 0,
    source: null,
    status: 'idle',
    error: null,

    current: () => get().queue[get().index] ?? null,

    playQueue: ({ tracks, startIndex, source }) => {
      if (tracks.length === 0) return
      set({ queue: tracks, source })
      void loadAt(Math.min(Math.max(startIndex, 0), tracks.length - 1))
    },

    togglePlay: async () => {
      const { status, index } = get()
      if (status === 'playing' || status === 'buffering') return audioEngine.pause()
      if (status === 'paused') return audioEngine.play()
      if (status === 'error') return loadAt(index)
    },

    next: () => {
      const { index, queue } = get()
      if (index < queue.length - 1) void loadAt(index + 1)
    },

    previous: async () => {
      const position = await audioEngine.getPosition()
      const { index } = get()
      if (position > RESTART_THRESHOLD_SEC || index === 0) return audioEngine.seekTo(0)
      return loadAt(index - 1)
    },

    seekTo: (positionSec) => audioEngine.seekTo(positionSec),

    stop: () => {
      loadGeneration++
      set({ queue: [], index: 0, source: null, status: 'idle', error: null })
      void audioEngine.stop()
    },

    handleTrackEnded: () => {
      const { index, queue } = get()
      if (index < queue.length - 1) return void loadAt(index + 1)
      set({ status: 'paused' })
    },

    handleEngineState: (state) => {
      if (state === 'ended') return get().handleTrackEnded()
      if (state === 'error') return set({ status: 'error', error: 'failed' })
      if (get().status === 'idle') return
      set({ status: state })
    },
  }
})
