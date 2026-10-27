<script lang="ts">
  import VolumeIcon from '../icons/VolumeIcon.svelte'
  import type { PlayerController } from '../player-controller'
  import IconButton from './IconButton.svelte'
  import RangeInput from './RangeInput.svelte'

  let { player }: { player: PlayerController } = $props()
</script>

<IconButton
  label={player.muted ? 'Unmute' : 'Mute'}
  onClick={player.toggleMute}
  pressed={player.muted}
>
  <VolumeIcon muted={player.muted} />
</IconButton>
<RangeInput
  label="Volume"
  max="1"
  min="0"
  onInput={player.setVolume}
  progress={player.volumeProgress}
  step="0.01"
  value={player.volume}
  variant="volume"
/>
