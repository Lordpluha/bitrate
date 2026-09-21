<svelte:options
  customElement={{
    shadow: 'open',
    props: {
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
  }}
/>

<script lang="ts">
  import { formatTime } from './lib/format-time'
  import { playPauseLabel } from './lib/play-pause-label'
  import { REPEAT_LABELS } from './lib/repeat-labels'
  import type { BitratePlayerProps } from './player-props'
  import { createPlayerEngineState } from './player-state.svelte'
  import PlayerActions from './parts/PlayerActions.svelte'
  import QualitySelect from './parts/QualitySelect.svelte'
  import SeekBar from './parts/SeekBar.svelte'
  import TrackMeta from './parts/TrackMeta.svelte'
  import TransportControls from './parts/TransportControls.svelte'
  import VolumeControl from './parts/VolumeControl.svelte'

  let {
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
</script>

<div class="root">
  <audio bind:this={audioEl} preload="none"></audio>

  <TrackMeta
    {coverUrl}
    {trackTitle}
    {artist}
    like={{ active: isLiked, onToggle: onLikeToggle }}
    {onPictureInPicture}
  />

  <div class="transport">
    <TransportControls
      shuffle={{ active: isShuffled, onToggle: onShuffleToggle }}
      {onPrevious}
      playback={{
        playing: player.computed.playing,
        disabled: player.computed.preparing || player.computed.effectiveBitrate === null,
        label: player.computed.preparing
          ? 'Preparing…'
          : playPauseLabel(trackTitle, player.computed.playing),
        onToggle: player.onPlayPause,
      }}
      {onNext}
      repeat={{
        active: repeatMode !== 'off',
        repeatOne: repeatMode === 'one',
        label: REPEAT_LABELS[repeatMode],
        onToggle: onRepeatToggle,
      }}
    />

    <SeekBar
      time={{
        elapsedLabel: formatTime(player.playbackState.currentTime),
        totalLabel: formatTime(player.computed.safeDuration),
      }}
      currentTime={player.playbackState.currentTime}
      duration={player.computed.safeDuration}
      progress={player.computed.seekProgress}
      onSeek={player.onSeek}
    />
  </div>

  <div class="actions">
    {#if player.computed.showQuality}
      <QualitySelect
        {renditions}
        value={player.computed.effectiveBitrate}
        disabled={player.computed.preparing}
        onChange={player.onQualityChange}
      />
    {/if}

    <VolumeControl
      muted={player.playbackState.muted}
      volume={player.playbackState.volume}
      progress={player.computed.volumeProgress}
      onVolume={player.onVolume}
      onMuteToggle={player.onMuteToggle}
    />

    <PlayerActions {onQueueOpen} {onExpand} />
  </div>

  {#if player.playbackState.error}
    <p class="error" role="alert">{player.playbackState.error.message}</p>
  {/if}
</div>

<style>
  :host {
    container-name: bitrate-player;
    container-type: inline-size;
    display: block;
    font-family: inherit;
  }

  .root {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    color: var(--color-text, var(--color-foreground, inherit));
    background-color: var(--color-background, transparent);
    border-top: 1px solid var(--color-border, currentColor);
    font-family: inherit;
    position: relative;
  }

  .transport {
    display: flex;
    flex: 2 1 40%;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
    max-width: 45rem;
  }

  .actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    flex: 1 1 35%;
    min-width: 0;
  }

  .error {
    position: absolute;
    left: 1rem;
    bottom: 100%;
    margin: 0 0 0.25rem;
    color: var(--color-destructive, crimson);
    font-size: 0.75rem;
  }

  @container bitrate-player (max-width: 36rem) {
    /** Quality and volume stay reachable at every width; only the total-duration readout shrinks. */
    .root {
      flex-wrap: wrap;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
    }

    .transport {
      order: 3;
      flex: 1 1 100%;
      max-width: none;
    }

    .actions {
      order: 2;
      flex: 1 1 100%;
      flex-wrap: wrap;
      justify-content: flex-start;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global(*) {
      transition: none !important;
    }
  }
</style>
