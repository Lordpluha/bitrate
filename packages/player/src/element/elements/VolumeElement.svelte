<svelte:options customElement={{ shadow: 'open', props: {} }} />

<script lang="ts">
  import { connectPlayer } from '../connect-player.svelte'
  import VolumeControl from '../parts/VolumeControl.svelte'

  /** `<bitrate-player-volume>` — mute and volume of the nearest root. */
  const player = connectPlayer($host())
</script>

{#if player.current}
  <div class="volume-control" part="volume">
    <VolumeControl player={player.current} />
  </div>
{/if}

<style>
  :host {
    display: block;
  }

  .volume-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
