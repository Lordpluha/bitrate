<svelte:options
  customElement={{
    shadow: 'open',
    props: {
      size: { type: 'String', attribute: 'size', reflect: true },
    },
  }}
/>

<script lang="ts">
  import type { BitratePlayerCoverSize } from '../../contract'
  import { connectPlayer } from '../connect-player.svelte'
  import Cover from '../parts/Cover.svelte'

  /** `<bitrate-player-cover size="sm|md|lg">` — the cover art of the nearest root. */
  let { size = 'md' }: { size?: BitratePlayerCoverSize } = $props()

  const player = connectPlayer($host())
</script>

{#if player.current}
  <Cover coverUrl={player.current.coverUrl} {size} />
{/if}

<style>
  :host {
    display: block;
  }

  :host([size='lg']) {
    width: 100%;
    height: 100%;
  }
</style>
