/**
 * Builds the controller one `<bitrate-player>` shares with its layouts and parts, over either
 * playback path: streaming mode while a `SlotPlayer` runs, otherwise the original single
 * `resolveSource` engine. Every field is a getter, so it stays reactive wherever it is read.
 */
import type { BitratePlayerStateDetail } from '../contract'
import type { PlayerController } from './player-controller'
import type { createPlayerEngineState } from './player-state.svelte'
import type { createStreamingState } from './streaming-state.svelte'

type LegacyState = ReturnType<typeof createPlayerEngineState>
type StreamingState = ReturnType<typeof createStreamingState>

/** The host-supplied metadata and callbacks, read from the root's props. */
export type PlayerView = Pick<
  PlayerController,
  | 'trackTitle'
  | 'artist'
  | 'coverUrl'
  | 'isLiked'
  | 'isShuffled'
  | 'repeatMode'
  | 'renditions'
  | 'callbacks'
>

export type CreatePlayerControllerInput = {
  readView: () => PlayerView
  /** Whether streaming mode has a source to play; Play is disabled without one. */
  hasSource: () => boolean
  legacy: LegacyState
  streaming: StreamingState
}

const percent = (value: number, total: number) =>
  total > 0 ? Math.min(100, Math.max(0, (value / total) * 100)) : 0

const numberFrom = (event: Event) => Number((event.target as HTMLInputElement).value)

/** The legacy engine's state in the shape of the streaming `statechange` detail. */
export function legacyStateDetail(legacy: LegacyState): BitratePlayerStateDetail {
  const { playbackState, computed } = legacy
  return {
    status: playbackState.status === 'preparing' ? 'loading' : playbackState.status,
    key: null,
    currentTime: playbackState.currentTime,
    duration: computed.safeDuration,
    volume: playbackState.volume,
    muted: playbackState.muted,
    bitrate: playbackState.bitrate,
    error: playbackState.error,
  }
}

export function createPlayerController({
  readView,
  hasSource,
  legacy,
  streaming,
}: CreatePlayerControllerInput): PlayerController {
  /** The streaming state while that path runs, else `null` for the legacy path. */
  const live = () => (streaming.active ? streaming.state : null)

  return {
    get trackTitle() {
      return readView().trackTitle
    },
    get artist() {
      return readView().artist
    },
    get coverUrl() {
      return readView().coverUrl
    },
    get isLiked() {
      return readView().isLiked
    },
    get isShuffled() {
      return readView().isShuffled
    },
    get repeatMode() {
      return readView().repeatMode
    },
    get renditions() {
      return readView().renditions
    },
    get callbacks() {
      return readView().callbacks
    },
    get playing() {
      const state = live()
      return state ? state.status === 'playing' : legacy.computed.playing
    },
    get preparing() {
      const state = live()
      return state ? state.status === 'loading' : legacy.computed.preparing
    },
    get canPlay() {
      const state = live()
      if (state) return hasSource()
      return !legacy.computed.preparing && legacy.computed.effectiveBitrate !== null
    },
    get currentTime() {
      return live()?.currentTime ?? legacy.playbackState.currentTime
    },
    get duration() {
      return live()?.duration ?? legacy.computed.safeDuration
    },
    get seekProgress() {
      const state = live()
      return state ? percent(state.currentTime, state.duration) : legacy.computed.seekProgress
    },
    get volume() {
      return live()?.volume ?? legacy.playbackState.volume
    },
    get volumeProgress() {
      const state = live()
      return state ? Math.round(state.volume * 100) : legacy.computed.volumeProgress
    },
    get muted() {
      return live()?.muted ?? legacy.playbackState.muted
    },
    get effectiveBitrate() {
      const state = live()
      return state ? state.bitrate : legacy.computed.effectiveBitrate
    },
    get showQuality() {
      return live() ? false : legacy.computed.showQuality
    },
    get error() {
      const state = live()
      return state ? state.error : legacy.playbackState.error
    },
    playPause: () => {
      const state = live()
      if (!state) {
        void legacy.onPlayPause()
        return
      }
      if (state.status === 'playing') streaming.pause()
      else streaming.play()
    },
    seek: (event) => {
      if (live()) streaming.seek(numberFrom(event))
      else legacy.onSeek(event)
    },
    setVolume: (event) => {
      if (live()) streaming.setVolume(numberFrom(event))
      else legacy.onVolume(event)
    },
    toggleMute: () => {
      const state = live()
      if (state) streaming.setMuted(!state.muted)
      else legacy.onMuteToggle()
    },
    changeQuality: (event) => {
      if (!live()) legacy.onQualityChange(event)
    },
  }
}
