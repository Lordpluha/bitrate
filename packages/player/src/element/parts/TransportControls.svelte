<script lang="ts">
  import type { BitratePlayerTransportControl } from '../../contract'
  import PauseIcon from '../icons/PauseIcon.svelte'
  import PlayIcon from '../icons/PlayIcon.svelte'
  import RepeatIcon from '../icons/RepeatIcon.svelte'
  import ShuffleIcon from '../icons/ShuffleIcon.svelte'
  import SkipBackIcon from '../icons/SkipBackIcon.svelte'
  import SkipForwardIcon from '../icons/SkipForwardIcon.svelte'
  import { playPauseLabel } from '../lib/play-pause-label'
  import { REPEAT_LABELS } from '../lib/repeat-labels'
  import type { PlayerController } from '../player-controller'
  import IconButton from './IconButton.svelte'

  /** A control renders only when it is in `controls` and, except Play, the root has its callback. */
  let {
    player,
    controls,
  }: {
    player: PlayerController
    controls: readonly BitratePlayerTransportControl[]
  } = $props()

  const shuffle = $derived(controls.includes('shuffle') ? player.callbacks.onShuffleToggle : null)
  const previous = $derived(controls.includes('prev') ? player.callbacks.onPrevious : null)
  const next = $derived(controls.includes('next') ? player.callbacks.onNext : null)
  const repeat = $derived(controls.includes('repeat') ? player.callbacks.onRepeatToggle : null)
</script>

<div class="transport-buttons" part="transport">
  {#if shuffle}
    <IconButton
      active={player.isShuffled}
      label={player.isShuffled ? 'Disable shuffle' : 'Enable shuffle'}
      onClick={shuffle}
      pressed={player.isShuffled}
    >
      <ShuffleIcon />
    </IconButton>
  {/if}

  {#if previous}
    <IconButton label="Previous track" onClick={previous}>
      <SkipBackIcon />
    </IconButton>
  {/if}

  {#if controls.includes('play')}
    <IconButton
      disabled={!player.canPlay}
      label={player.preparing ? 'Preparing…' : playPauseLabel(player.trackTitle, player.playing)}
      onClick={player.playPause}
      pressed={player.playing}
      variant="play"
    >
      {#if player.playing}
        <PauseIcon />
      {:else}
        <PlayIcon />
      {/if}
    </IconButton>
  {/if}

  {#if next}
    <IconButton label="Next track" onClick={next}>
      <SkipForwardIcon />
    </IconButton>
  {/if}

  {#if repeat}
    <IconButton
      active={player.repeatMode !== 'off'}
      label={REPEAT_LABELS[player.repeatMode]}
      onClick={repeat}
      pressed={player.repeatMode !== 'off'}
    >
      <RepeatIcon repeatOne={player.repeatMode === 'one'} />
    </IconButton>
  {/if}
</div>

<style>
  .transport-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--bitrate-player-transport-gap, 1rem);
  }
</style>
