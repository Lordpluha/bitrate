<svelte:options customElement={{ shadow: 'open', props: {} }} />

<script lang="ts">
  import { connectPlayer } from '../connect-player.svelte'
  import QualitySelect from '../parts/QualitySelect.svelte'

  /** `<bitrate-player-quality>` — the rendition picker; renders only with more than one rendition. */
  const player = connectPlayer($host())
</script>

{#if player.current?.showQuality}
  <QualitySelect player={player.current} />
{/if}

<style>
  :host {
    display: block;
  }
</style>
