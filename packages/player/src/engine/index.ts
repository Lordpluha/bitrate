/**
 * Framework-free playback engine driving an injected `HTMLMediaElement`.
 *
 * The engine never reads host globals (`process.env`, `NEXT_PUBLIC_*`, `import.meta.env`); it
 * receives its transport — the media element and a source resolver — by injection from the
 * host. See `.claude/rules/player-rules.md`.
 */
import type { BitratePlayerErrorCode, BitratePlayerSourceResolver } from '../contract'

/** `MediaError.code` values the DOM spec defines — kept local so the engine needs no DOM lib types at module scope. */
const MEDIA_ERR_NETWORK = 2
const MEDIA_ERR_SRC_NOT_SUPPORTED = 4

export type PlaybackStatus = 'idle' | 'preparing' | 'playing' | 'paused' | 'error'

export type PlaybackEngineError = {
  code: BitratePlayerErrorCode
  message: string
}

export type PlaybackEngineState = {
  status: PlaybackStatus
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  bitrate: number | null
  error: PlaybackEngineError | null
}

export type PlaybackEngineListener = (state: PlaybackEngineState) => void

export type CreatePlaybackEngineInput = {
  media: HTMLMediaElement
  resolveSource: BitratePlayerSourceResolver
  /** Fired when the underlying media reaches the end of its source. */
  onEnded?: () => void
}

export type PlaybackEngine = {
  /** Resolves a source for `bitrate` (skipping resolution if it is already loaded and healthy) and plays it. */
  play(bitrate: number | null): Promise<void>
  pause(): void
  seek(seconds: number): void
  setVolume(volume: number): void
  setMuted(muted: boolean): void
  subscribe(listener: PlaybackEngineListener): () => void
  getState(): PlaybackEngineState
  destroy(): void
}

function initialState(): PlaybackEngineState {
  return {
    status: 'idle',
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    bitrate: null,
    error: null,
  }
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

/** Creates a playback engine bound to `media`, resolving sources through `resolveSource`. */
export function createPlaybackEngine({
  media,
  resolveSource,
  onEnded,
}: CreatePlaybackEngineInput): PlaybackEngine {
  let state = initialState()
  const listeners = new Set<PlaybackEngineListener>()
  let loadedBitrate: number | null = null
  let destroyed = false

  function setState(patch: Partial<PlaybackEngineState>): void {
    state = { ...state, ...patch }
    for (const listener of listeners) listener(state)
  }

  function handleTimeUpdate(): void {
    setState({ currentTime: media.currentTime })
  }

  function handleDurationChange(): void {
    setState({ duration: Number.isFinite(media.duration) ? media.duration : 0 })
  }

  function handleVolumeChange(): void {
    setState({ volume: media.volume, muted: media.muted })
  }

  function handlePlay(): void {
    setState({ status: 'playing', error: null })
  }

  function handlePause(): void {
    if (state.status === 'error') return
    setState({ status: 'paused' })
  }

  function handleEnded(): void {
    setState({ status: 'paused', currentTime: 0 })
    onEnded?.()
  }

  function handleError(): void {
    const mediaError = media.error
    if (!mediaError) return

    if (mediaError.code === MEDIA_ERR_SRC_NOT_SUPPORTED) {
      setState({
        status: 'error',
        error: { code: 'unsupported', message: 'This browser cannot play this rendition.' },
      })
      return
    }

    const code: BitratePlayerErrorCode =
      mediaError.code === MEDIA_ERR_NETWORK ? 'network' : 'playback'
    setState({
      status: 'error',
      error: { code, message: 'Playback stopped — press play to continue.' },
    })
    /** Drop the loaded source so the next `play()` re-resolves rather than retrying a stale one. */
    loadedBitrate = null
  }

  media.addEventListener('timeupdate', handleTimeUpdate)
  media.addEventListener('durationchange', handleDurationChange)
  media.addEventListener('volumechange', handleVolumeChange)
  media.addEventListener('play', handlePlay)
  media.addEventListener('pause', handlePause)
  media.addEventListener('ended', handleEnded)
  media.addEventListener('error', handleError)

  async function play(bitrate: number | null): Promise<void> {
    if (destroyed) return

    const needsSource = loadedBitrate !== bitrate

    if (needsSource) {
      setState({ status: 'preparing', error: null })

      let url: string
      try {
        url = await resolveSource({ bitrate })
      } catch (error) {
        const message = errorMessage(error, 'Could not start playback.')
        setState({ status: 'error', error: { code: 'source', message } })
        throw error instanceof Error ? error : new Error(message)
      }

      media.src = url
      loadedBitrate = bitrate
      setState({ bitrate })
    }

    try {
      await media.play()
    } catch (error) {
      const message = errorMessage(error, 'Playback was blocked.')
      setState({ status: 'error', error: { code: 'playback', message } })
      throw error instanceof Error ? error : new Error(message)
    }
  }

  function pause(): void {
    media.pause()
  }

  function seek(seconds: number): void {
    media.currentTime = seconds
  }

  function setVolume(volume: number): void {
    media.volume = Math.min(1, Math.max(0, volume))
  }

  function setMuted(muted: boolean): void {
    media.muted = muted
  }

  function subscribe(listener: PlaybackEngineListener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  function getState(): PlaybackEngineState {
    return state
  }

  function destroy(): void {
    if (destroyed) return
    destroyed = true

    media.pause()
    media.removeAttribute('src')
    media.load()

    media.removeEventListener('timeupdate', handleTimeUpdate)
    media.removeEventListener('durationchange', handleDurationChange)
    media.removeEventListener('volumechange', handleVolumeChange)
    media.removeEventListener('play', handlePlay)
    media.removeEventListener('pause', handlePause)
    media.removeEventListener('ended', handleEnded)
    media.removeEventListener('error', handleError)

    listeners.clear()
  }

  return { play, pause, seek, setVolume, setMuted, subscribe, getState, destroy }
}
