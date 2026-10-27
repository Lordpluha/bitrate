/**
 * Reactive state for `<bitrate-player>` in streaming mode: a `SlotPlayer` over the root's two
 * media elements, created once both exist and the host has set `streaming`, fed `source`,
 * `next`, volume and mute as they change. `$host()` stays in `BitratePlayer.svelte`; events go
 * out through the injected `dispatch`.
 */
import { untrack } from 'svelte'
import type {
  BitratePlayerSource,
  BitratePlayerStateDetail,
  BitratePlayerStreaming,
} from '../contract'
import { SlotPlayer } from '../engine'

type DispatchFn = <T>(type: string, detail?: T) => void

const IDLE_STATE: BitratePlayerStateDetail = {
  status: 'idle',
  key: null,
  currentTime: 0,
  duration: 0,
  volume: 1,
  muted: false,
  bitrate: null,
  error: null,
}

export type CreateStreamingStateInput = {
  getMedia: () => readonly [HTMLAudioElement, HTMLAudioElement] | null
  getStreaming: () => BitratePlayerStreaming | null
  getSource: () => BitratePlayerSource | null
  getNext: () => BitratePlayerSource | null
  getVolume: () => number
  getMuted: () => boolean
  dispatch: DispatchFn
}

export function createStreamingState(input: CreateStreamingStateInput) {
  let player: SlotPlayer | null = $state.raw(null)
  let state: BitratePlayerStateDetail = $state.raw(IDLE_STATE)
  /**
   * A play/pause asked for before the `SlotPlayer` exists — the host may call `play()` right
   * after assigning `streaming`, while the player is only created in the next effect flush.
   */
  let pendingIntent: 'play' | 'pause' | null = null

  $effect(() => {
    const media = input.getMedia()
    const streaming = input.getStreaming()
    if (!media || !streaming) return

    const created = new SlotPlayer({
      media,
      streaming,
      onStateChange: (next) => {
        state = next
        input.dispatch('statechange', next)
      },
      onPlayingChange: (playing) => input.dispatch(playing ? 'play' : 'pause'),
      onEnded: (detail) => input.dispatch('ended', detail),
      onFatalError: (error) => input.dispatch('error', error),
    })
    untrack(() => {
      created.setVolume(input.getVolume())
      created.setMuted(input.getMuted())
      if (pendingIntent === 'play') created.play()
      pendingIntent = null
    })
    player = created

    return () => {
      created.destroy()
      player = null
      state = IDLE_STATE
    }
  })

  $effect(() => {
    const source = input.getSource()
    player?.setSource(source)
  })

  $effect(() => {
    const next = input.getNext()
    player?.setNext(next)
  })

  $effect(() => {
    const volume = input.getVolume()
    player?.setVolume(volume)
  })

  $effect(() => {
    const muted = input.getMuted()
    player?.setMuted(muted)
  })

  return {
    /** True while a `SlotPlayer` is running, i.e. the element is in streaming mode. */
    get active() {
      return player !== null
    },
    get state() {
      return state
    },
    play: () => {
      if (player) player.play()
      else pendingIntent = 'play'
    },
    pause: () => {
      if (player) player.pause()
      else pendingIntent = 'pause'
    },
    seek: (seconds: number) => player?.seek(seconds),
    setVolume: (volume: number) => player?.setVolume(volume),
    setMuted: (muted: boolean) => player?.setMuted(muted),
  }
}
