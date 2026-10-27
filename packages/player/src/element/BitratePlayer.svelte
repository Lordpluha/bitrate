<svelte:options
  customElement={{
    shadow: 'open',
    props: {
      chrome: { type: 'String', attribute: 'chrome', reflect: true },
      renditions: { type: 'Array' },
      resolveSource: {},
      trackTitle: { type: 'String', attribute: 'track-title', reflect: true },
      artist: { type: 'String', attribute: 'artist', reflect: true },
      coverUrl: { type: 'String', attribute: 'cover-url', reflect: true },
      isLiked: { type: 'Boolean', attribute: 'is-liked', reflect: true },
      isShuffled: { type: 'Boolean', attribute: 'is-shuffled', reflect: true },
      repeatMode: { type: 'String', attribute: 'repeat-mode', reflect: true },
      onNext: {},
      onPrevious: {},
      onLikeToggle: {},
      onShuffleToggle: {},
      onRepeatToggle: {},
      onExpand: {},
      onPictureInPicture: {},
      onQueueOpen: {},
    },
    extend: withPlayerProvider,
  }}
/>

<script lang="ts" module>
  import { withPlayerProvider } from './player-context'
</script>

<script lang="ts">
  import ChromeLayout from './layouts/ChromeLayout.svelte'
  import { resolveChrome } from './lib/controls'
  import { isPlayerProviderHost } from './player-context'
  import type { PlayerController } from './player-controller'
  import type { BitratePlayerProps } from './player-props'
  import { createPlayerEngineState } from './player-state.svelte'

  let {
    chrome = 'bar',
    renditions = [],
    resolveSource = null,
    trackTitle = '',
    artist = '',
    coverUrl = '',
    isLiked = false,
    isShuffled = false,
    repeatMode = 'off',
    onNext = null,
    onPrevious = null,
    onLikeToggle = null,
    onShuffleToggle = null,
    onRepeatToggle = null,
    onExpand = null,
    onPictureInPicture = null,
    onQueueOpen = null,
  }: BitratePlayerProps = $props()

  let audioEl: HTMLAudioElement | undefined = $state(undefined)
  let slotEl: HTMLElement | undefined = $state(undefined)
  /** True once the host composes its own parts; the built-in layout steps aside. */
  let composed = $state(false)

  function dispatch<T>(type: string, detail?: T): void {
    $host().dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }))
  }

  /** Rebinds host play()/pause() to the current engine — $host() must stay in this file. */
  function exposeTransport(transport: { play: () => Promise<void>; pause: () => void }): void {
    const host = $host() as HTMLElement & { play: () => Promise<void>; pause: () => void }
    host.play = transport.play
    host.pause = transport.pause
  }

  const player = createPlayerEngineState({
    getAudioEl: () => audioEl,
    getResolveSource: () => resolveSource,
    getRenditions: () => renditions,
    dispatch,
    exposeTransport,
  })

  const callbacks: PlayerController['callbacks'] = {
    get onNext() {
      return onNext
    },
    get onPrevious() {
      return onPrevious
    },
    get onLikeToggle() {
      return onLikeToggle
    },
    get onShuffleToggle() {
      return onShuffleToggle
    },
    get onRepeatToggle() {
      return onRepeatToggle
    },
    get onExpand() {
      return onExpand
    },
    get onPictureInPicture() {
      return onPictureInPicture
    },
    get onQueueOpen() {
      return onQueueOpen
    },
  }

  const controller: PlayerController = {
    get trackTitle() {
      return trackTitle
    },
    get artist() {
      return artist
    },
    get coverUrl() {
      return coverUrl
    },
    get isLiked() {
      return isLiked
    },
    get isShuffled() {
      return isShuffled
    },
    get repeatMode() {
      return repeatMode
    },
    get renditions() {
      return renditions
    },
    callbacks,
    get playing() {
      return player.computed.playing
    },
    get preparing() {
      return player.computed.preparing
    },
    get canPlay() {
      return !player.computed.preparing && player.computed.effectiveBitrate !== null
    },
    get currentTime() {
      return player.playbackState.currentTime
    },
    get duration() {
      return player.computed.safeDuration
    },
    get seekProgress() {
      return player.computed.seekProgress
    },
    get volume() {
      return player.playbackState.volume
    },
    get volumeProgress() {
      return player.computed.volumeProgress
    },
    get muted() {
      return player.playbackState.muted
    },
    get effectiveBitrate() {
      return player.computed.effectiveBitrate
    },
    get showQuality() {
      return player.computed.showQuality
    },
    get error() {
      return player.playbackState.error
    },
    playPause: () => void player.onPlayPause(),
    seek: player.onSeek,
    setVolume: player.onVolume,
    toggleMute: player.onMuteToggle,
    changeQuality: player.onQualityChange,
  }

  /** Not named `host`: `$host` would then read as a store subscription to it. */
  const rootElement = $host()
  if (isPlayerProviderHost(rootElement)) rootElement.providePlayer(controller)

  function syncComposed(): void {
    composed = slotEl instanceof HTMLSlotElement && slotEl.assignedElements().length > 0
  }

  /** Svelte's element typings carry no `onslotchange`, so the listener is attached here. */
  $effect(() => {
    const slot = slotEl
    if (!slot) return
    syncComposed()
    slot.addEventListener('slotchange', syncComposed)
    return () => slot.removeEventListener('slotchange', syncComposed)
  })
</script>

<audio bind:this={audioEl} preload="none"></audio>

<!--
  A native slot for the host's part elements — `<svelte:element>`, since `<slot>` is Svelte's
  own slot syntax. Whitespace-only text the host leaves inside the tag does not count as
  composing: only assigned elements switch the built-in layout off.
-->
<svelte:element this={"slot"} bind:this={slotEl} />

{#if !composed}
  <ChromeLayout chrome={resolveChrome(chrome)} player={controller} />
{/if}

<style>
  :host {
    container-name: bitrate-player;
    container-type: inline-size;
    display: block;
    font-family: inherit;
  }

  @media (prefers-reduced-motion: reduce) {
    :global(*) {
      transition: none !important;
    }
  }
</style>
