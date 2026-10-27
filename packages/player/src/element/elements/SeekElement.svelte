<svelte:options
  customElement={{
    shadow: 'open',
    props: {
      variant: { type: 'String', attribute: 'variant', reflect: true },
    },
  }}
/>

<script lang="ts">
  import type { BitratePlayerSeekVariant } from '../../contract'
  import { connectPlayer } from '../connect-player.svelte'
  import SeekBar from '../parts/SeekBar.svelte'

  /** `<bitrate-player-seek variant="full|thin">` — the seek slider of the nearest root. */
  let { variant = 'full' }: { variant?: BitratePlayerSeekVariant } = $props()

  const player = connectPlayer($host())
</script>

{#if player.current}
  <SeekBar player={player.current} variant={variant === 'thin' ? 'thin' : 'full'} />
{/if}

<style>
  :host {
    display: block;
  }
</style>
