<script lang="ts">
  import type { BitratePlayerSeekVariant } from '../../contract'
  import { formatTime } from '../lib/format-time'
  import type { PlayerController } from '../player-controller'
  import RangeInput from './RangeInput.svelte'

  let {
    player,
    variant = 'full',
    keepTotal = false,
  }: {
    player: PlayerController
    variant?: BitratePlayerSeekVariant
    /** Keeps the total-duration readout in a narrow container, where the bar drops it. */
    keepTotal?: boolean
  } = $props()
</script>

<div class="progress progress--{variant}" part="seek">
  {#if variant === 'full'}
    <span class="time time--elapsed">{formatTime(player.currentTime)}</span>
  {/if}
  <RangeInput
    label={player.labels.seek}
    max={player.duration}
    min="0"
    onInput={player.seek}
    progress={player.seekProgress}
    step="1"
    value={player.currentTime}
    variant="seek"
  />
  {#if variant === 'full'}
    <span class="time time--total" class:time--kept={keepTotal}>
      {formatTime(player.duration)}
    </span>
  {:else if variant === 'stacked'}
    <span class="readouts">
      <span class="time">{formatTime(player.currentTime)}</span>
      <span class="time">{formatTime(player.duration)}</span>
    </span>
  {/if}
</div>

<style>
  .progress {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
  }

  /** A hairline that still seeks: no readouts, a thinner track, no resting thumb. */
  .progress--thin {
    --bitrate-player-track-height: 0.125rem;
  }

  .progress--thin > :global(input) {
    min-width: 0;
  }

  /** The rail on its own line, the elapsed and total time under its two ends. */
  .progress--stacked {
    flex-direction: column;
    align-items: stretch;
  }

  .readouts {
    display: flex;
    justify-content: space-between;
  }

  .readouts .time {
    min-width: 0;
  }

  .time {
    min-width: var(--bitrate-player-time-min-width, 2.5rem);
    text-align: center;
    font-variant-numeric: tabular-nums;
    font-size: var(--bitrate-player-time-size, 0.75rem);
    color: var(--color-text-subdued, var(--color-muted-foreground, inherit));
  }

  @container bitrate-player (max-width: 36rem) {
    .time--total:not(.time--kept) {
      display: none;
    }
  }
</style>
