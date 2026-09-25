<script lang="ts">
  import RangeInput from './RangeInput.svelte'

  type SeekBarTime = {
    elapsedLabel: string
    totalLabel: string
  }

  let {
    time,
    currentTime,
    duration,
    progress,
    onSeek,
  }: {
    time: SeekBarTime
    currentTime: number
    duration: number
    progress: number
    onSeek: (event: Event) => void
  } = $props()
</script>

<div class="progress">
  <span class="time time--elapsed">{time.elapsedLabel}</span>
  <RangeInput
    label="Seek playback"
    max={duration}
    min="0"
    onInput={onSeek}
    {progress}
    step="1"
    value={currentTime}
    variant="seek"
  />
  <span class="time time--total">{time.totalLabel}</span>
</div>

<style>
  .progress {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
  }

  .time {
    min-width: 2.5rem;
    text-align: center;
    font-variant-numeric: tabular-nums;
    font-size: 0.75rem;
    color: var(--color-text-subdued, var(--color-muted-foreground, inherit));
  }

  @container bitrate-player (max-width: 36rem) {
    .time--total {
      display: none;
    }
  }
</style>
