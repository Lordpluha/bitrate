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
      streaming: {},
      source: {},
      next: {},
      volume: { type: 'Number', attribute: 'volume' },
      muted: { type: 'Boolean', attribute: 'muted', reflect: true },
      mirror: {},
      labels: {},
      mediaSession: { type: 'Boolean', attribute: 'media-session', reflect: true },
    },
    extend: withPlayerProvider,
  }}
/>

<script lang="ts" module>
  import { withPlayerProvider } from './player-context'
</script>

<script lang="ts">
  import ChromeLayout from './layouts/ChromeLayout.svelte'
  import { createPlayerController, legacyStateDetail } from './create-controller'
  import { resolveChrome } from './lib/controls'
  import { resolveLabels } from './lib/labels'
  import { type HostTransport, isPlayerProviderHost } from './player-context'
  import type { PlayerController } from './player-controller'
  import type { BitratePlayerProps } from './player-props'
  import { createPlayerEngineState } from './player-state.svelte'
  import { createMediaSession } from './media-session.svelte'
  import { createStreamingState } from './streaming-state.svelte'

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
    streaming = null,
    source = null,
    next = null,
    volume = 1,
    muted = false,
    mirror = null,
    labels = null,
    mediaSession = false,
  }: BitratePlayerProps = $props()

  let audioEl: HTMLAudioElement | undefined = $state(undefined)
  /** The standby element streaming mode prefetches into; rendered only in that mode. */
  let standbyEl: HTMLAudioElement | undefined = $state(undefined)
  let slotEl: HTMLElement | undefined = $state(undefined)
  /** True once the host composes its own parts; the built-in layout steps aside. */
  let composed = $state(false)
  /** The controller of the root this one mirrors, once that root answers. */
  let mirrored: PlayerController | null = $state.raw(null)

  function dispatch<T>(type: string, detail?: T): void {
    $host().dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }))
  }

  /** Rebinds the host's play()/pause()/seek() to the engine in use — $host() must stay here. */
  function exposeTransport(transport: Partial<HostTransport>): void {
    const host = $host()
    if (isPlayerProviderHost(host)) host.provideTransport(transport)
  }

  const legacy = createPlayerEngineState({
    getAudioEl: () => audioEl,
    getResolveSource: () => resolveSource,
    getRenditions: () => renditions,
    dispatch,
    exposeTransport,
  })

  const live = createStreamingState({
    getMedia: () => (audioEl && standbyEl ? [audioEl, standbyEl] : null),
    getStreaming: () => streaming,
    getSource: () => source,
    getNext: () => next,
    getVolume: () => volume,
    getMuted: () => muted,
    dispatch,
  })

  $effect(() => {
    if (!live.active) return
    exposeTransport({
      play: async () => live.play(),
      pause: () => live.pause(),
      seek: (seconds) => live.seek(seconds),
    })
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

  const resolvedLabels = $derived(resolveLabels(labels))

  const controller = createPlayerController({
    readView: () => ({
      trackTitle,
      artist,
      coverUrl,
      isLiked,
      isShuffled,
      repeatMode,
      renditions,
      callbacks,
      labels: resolvedLabels,
    }),
    hasSource: () => source !== null,
    legacy,
    streaming: live,
  })

  /** Not named `host`: `$host` would then read as a store subscription to it. */
  const rootElement = $host()
  /**
   * The host methods exist from upgrade: a host may call them right after assigning
   * `streaming`, before the streaming player is created, which then applies the intent. The
   * `resolveSource` engine rebinds play/pause to itself once a resolver is set.
   */
  exposeTransport({
    play: async () => live.play(),
    pause: () => live.pause(),
    seek: (seconds) => live.seek(seconds),
  })
  if (isPlayerProviderHost(rootElement)) {
    rootElement.providePlayer(controller)
    rootElement.provideState(() => (live.active ? live.state : legacyStateDetail(legacy)))
  }

  /** A mirror renders the other root's controller and never plays anything itself. */
  $effect(() => {
    const target = mirror
    if (!target || target === rootElement || !isPlayerProviderHost(target)) {
      mirrored = null
      return
    }
    let current = true
    target.requestPlayer((answer) => {
      if (current) mirrored = answer
    })
    return () => {
      current = false
    }
  })

  const shared = $derived(mirrored ?? controller)

  /** Only an element that plays owns the session; a mirror never does. */
  createMediaSession({
    getEnabled: () => mediaSession && !mirror,
    getController: () => controller,
    handlers: {
      play: () => {
        if (live.active) live.play()
        else if (!controller.playing) void legacy.onPlayPause()
      },
      pause: () => {
        if (live.active) live.pause()
        else if (controller.playing) void legacy.onPlayPause()
      },
      seekTo: (seconds) => {
        if (live.active) live.seek(seconds)
      },
    },
  })

  $effect(() => {
    if (isPlayerProviderHost(rootElement)) rootElement.providePlayer(shared)
  })

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
{#if streaming}
  <audio bind:this={standbyEl} preload="none"></audio>
{/if}

<!--
  A native slot for the host's part elements — `<svelte:element>`, since `<slot>` is Svelte's
  own slot syntax. Whitespace-only text the host leaves inside the tag does not count as
  composing: only assigned elements switch the built-in layout off.
-->
<svelte:element this={"slot"} bind:this={slotEl} />

{#if !composed}
  <div class="layout-container">
    <ChromeLayout chrome={resolveChrome(chrome)} player={shared} />
  </div>
{/if}

<style>
  :host {
    display: block;
    font-family: inherit;
  }

  /**
   * The size container the built-in layouts query. Not on :host — inline-size containment
   * would stop a host-composed element from taking its content's width in a flex row. It
   * passes a sized host's height on, so floating fills a picture-in-picture window as it resizes.
   */
  .layout-container {
    container-name: bitrate-player;
    container-type: inline-size;
    height: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    :global(*) {
      transition: none !important;
    }
  }
</style>
