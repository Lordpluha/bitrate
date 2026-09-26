/**
 * Reactive playback state for one `<bitrate-player>` instance — the engine lifecycle, the
 * `$effect` that owns it, and the derived values/handlers the root component renders. `$host()`
 * is a compiler macro tied to its `.svelte` file, so host-element calls are injected from
 * `BitratePlayer.svelte` instead — see `.claude/rules/player-rules.md` and the `svelte` skill.
 */
import { createPlaybackEngine, type PlaybackEngine, type PlaybackEngineState } from '../engine'
import type { BitratePlayerRendition, BitratePlayerSourceResolver } from '../contract'

type DispatchFn = <T>(type: string, detail?: T) => void

type PlayerTransport = {
  play: () => Promise<void>
  pause: () => void
}

export type CreatePlayerEngineStateInput = {
  getAudioEl: () => HTMLAudioElement | undefined
  getResolveSource: () => BitratePlayerSourceResolver | null
  getRenditions: () => BitratePlayerRendition[]
  dispatch: DispatchFn
  /** Rebinds host `play()`/`pause()` whenever a new engine is wired up. */
  exposeTransport: (transport: PlayerTransport) => void
}

/** Creates the engine-backed reactive state for one `<bitrate-player>` instance. */
export function createPlayerEngineState(input: CreatePlayerEngineStateInput) {
  let engine: PlaybackEngine | null = null
  let playbackState: PlaybackEngineState = $state({
    status: 'idle',
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    bitrate: null,
    error: null,
  })
  let selectedBitrate: number | null = $state(null)

  const effectiveBitrate = $derived(selectedBitrate ?? input.getRenditions()[0]?.bitrate ?? null)
  const showQuality = $derived(input.getRenditions().length > 1)
  const preparing = $derived(playbackState.status === 'preparing')
  const playing = $derived(playbackState.status === 'playing')
  const safeDuration = $derived(
    Number.isFinite(playbackState.duration) && playbackState.duration > 0
      ? playbackState.duration
      : 0,
  )
  const seekProgress = $derived(
    safeDuration > 0
      ? Math.min(100, Math.max(0, (playbackState.currentTime / safeDuration) * 100))
      : 0,
  )
  const volumeProgress = $derived(Math.round(playbackState.volume * 100))

  $effect(() => {
    const media = input.getAudioEl()
    const resolver = input.getResolveSource()
    if (!media || !resolver) {
      engine?.destroy()
      engine = null
      return
    }

    /** Seeded locally, not read from `playbackState` — else this effect depends on its own output. */
    let previousStatus: PlaybackEngineState['status'] = 'idle'
    engine = createPlaybackEngine({
      media,
      resolveSource: resolver,
      onEnded: () => input.dispatch('ended'),
    })
    const unsubscribe = engine.subscribe((next) => {
      if (next.status === 'playing' && previousStatus !== 'playing') input.dispatch('play')
      if (next.status === 'paused' && previousStatus === 'playing') input.dispatch('pause')
      if (next.status === 'error' && next.error) input.dispatch('error', next.error)
      previousStatus = next.status
      playbackState = next
    })

    input.exposeTransport({
      play: () => (engine ? engine.play(effectiveBitrate) : Promise.resolve()),
      pause: () => engine?.pause(),
    })

    return () => {
      unsubscribe()
      engine?.destroy()
      engine = null
    }
  })

  async function onPlayPause(): Promise<void> {
    if (!engine) return
    if (playing) {
      engine.pause()
      return
    }
    try {
      await engine.play(effectiveBitrate)
    } catch {
      /** Surfaced through `playbackState.error` / the `error` event — nothing further to do here. */
    }
  }

  function onQualityChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value)
    selectedBitrate = value
    if (playing) engine?.pause()
    input.dispatch('qualitychange', { bitrate: value })
  }

  function onSeek(event: Event): void {
    engine?.seek(Number((event.target as HTMLInputElement).value))
  }

  function onVolume(event: Event): void {
    engine?.setVolume(Number((event.target as HTMLInputElement).value))
  }

  function onMuteToggle(): void {
    engine?.setMuted(!playbackState.muted)
  }

  return {
    get playbackState() {
      return playbackState
    },
    get computed() {
      return {
        effectiveBitrate,
        showQuality,
        preparing,
        playing,
        safeDuration,
        seekProgress,
        volumeProgress,
      }
    },
    onPlayPause,
    onQualityChange,
    onSeek,
    onVolume,
    onMuteToggle,
  }
}
