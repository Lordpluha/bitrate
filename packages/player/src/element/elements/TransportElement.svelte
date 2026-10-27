<svelte:options
  customElement={{
    shadow: 'open',
    props: {
      controls: { type: 'String', attribute: 'controls', reflect: true },
    },
  }}
/>

<script lang="ts">
  import { BITRATE_PLAYER_TRANSPORT_CONTROLS } from '../../contract'
  import { connectPlayer } from '../connect-player.svelte'
  import { parseControls } from '../lib/controls'
  import TransportControls from '../parts/TransportControls.svelte'

  /** `<bitrate-player-transport controls="shuffle prev play next repeat">` — narrowed by `controls`. */
  let { controls = null }: { controls?: string | null } = $props()

  const player = connectPlayer($host())
  const allowed = $derived(parseControls(controls, BITRATE_PLAYER_TRANSPORT_CONTROLS))
</script>

{#if player.current}
  <TransportControls controls={allowed} player={player.current} />
{/if}

<style>
  :host {
    display: block;
  }
</style>
