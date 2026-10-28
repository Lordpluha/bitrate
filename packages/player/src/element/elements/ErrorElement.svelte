<svelte:options customElement={{ shadow: 'open', props: {} }} />

<script lang="ts">
  import { connectPlayer } from '../connect-player.svelte'
  import ErrorMessage from '../parts/ErrorMessage.svelte'

  /** `<bitrate-player-error>` — the playback error of the nearest root, announced as an alert. */
  const player = connectPlayer($host())
</script>

{#if player.current}
  <ErrorMessage player={player.current} />
{/if}

<style>
  :host {
    display: block;
  }
</style>
