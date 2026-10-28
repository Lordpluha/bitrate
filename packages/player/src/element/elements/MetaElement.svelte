<svelte:options customElement={{ shadow: 'open', props: {} }} />

<script lang="ts">
  import { connectPlayer } from '../connect-player.svelte'
  import TrackText from '../parts/TrackText.svelte'

  /** `<bitrate-player-meta>` — the title and artist of the nearest root. */
  const player = connectPlayer($host())
</script>

{#if player.current}
  <TrackText artist={player.current.artist} trackTitle={player.current.trackTitle} />
{/if}

<style>
  :host {
    display: block;
    min-width: 0;
  }
</style>
