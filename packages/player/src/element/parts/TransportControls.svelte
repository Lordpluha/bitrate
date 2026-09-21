<script lang="ts">
  import PauseIcon from '../icons/PauseIcon.svelte'
  import PlayIcon from '../icons/PlayIcon.svelte'
  import RepeatIcon from '../icons/RepeatIcon.svelte'
  import ShuffleIcon from '../icons/ShuffleIcon.svelte'
  import SkipBackIcon from '../icons/SkipBackIcon.svelte'
  import SkipForwardIcon from '../icons/SkipForwardIcon.svelte'
  import IconButton from './IconButton.svelte'

  type TransportToggle = {
    active: boolean
    onToggle: (() => void) | null
  }

  type PlaybackToggle = {
    playing: boolean
    disabled: boolean
    label: string
    onToggle: () => void
  }

  type RepeatToggle = {
    active: boolean
    repeatOne: boolean
    label: string
    onToggle: (() => void) | null
  }

  let {
    shuffle,
    onPrevious = null,
    playback,
    onNext = null,
    repeat,
  }: {
    shuffle: TransportToggle
    onPrevious?: (() => void) | null
    playback: PlaybackToggle
    onNext?: (() => void) | null
    repeat: RepeatToggle
  } = $props()
</script>

<div class="transport-buttons">
  {#if shuffle.onToggle}
    <IconButton
      active={shuffle.active}
      label={shuffle.active ? 'Disable shuffle' : 'Enable shuffle'}
      onClick={shuffle.onToggle}
      pressed={shuffle.active}
    >
      <ShuffleIcon />
    </IconButton>
  {/if}

  {#if onPrevious}
    <IconButton label="Previous track" onClick={onPrevious}>
      <SkipBackIcon />
    </IconButton>
  {/if}

  <IconButton
    disabled={playback.disabled}
    label={playback.label}
    onClick={playback.onToggle}
    pressed={playback.playing}
    variant="play"
  >
    {#if playback.playing}
      <PauseIcon />
    {:else}
      <PlayIcon />
    {/if}
  </IconButton>

  {#if onNext}
    <IconButton label="Next track" onClick={onNext}>
      <SkipForwardIcon />
    </IconButton>
  {/if}

  {#if repeat.onToggle}
    <IconButton
      active={repeat.active}
      label={repeat.label}
      onClick={repeat.onToggle}
      pressed={repeat.active}
    >
      <RepeatIcon repeatOne={repeat.repeatOne} />
    </IconButton>
  {/if}
</div>

<style>
  .transport-buttons {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
</style>
