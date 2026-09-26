<script lang="ts">
  import VolumeIcon from '../icons/VolumeIcon.svelte'
  import IconButton from './IconButton.svelte'
  import RangeInput from './RangeInput.svelte'

  let {
    muted,
    volume,
    progress,
    onVolume,
    onMuteToggle,
  }: {
    muted: boolean
    volume: number
    progress: number
    onVolume: (event: Event) => void
    onMuteToggle: () => void
  } = $props()
</script>

<IconButton label={muted ? 'Unmute' : 'Mute'} onClick={onMuteToggle} pressed={muted}>
  <VolumeIcon {muted} />
</IconButton>
<RangeInput
  label="Volume"
  max="1"
  min="0"
  onInput={onVolume}
  {progress}
  step="0.01"
  value={volume}
  variant="volume"
/>
