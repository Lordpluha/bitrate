<svelte:options
  customElement={{
    shadow: 'open',
    props: {
      controls: { type: 'String', attribute: 'controls', reflect: true },
    },
  }}
/>

<script lang="ts">
  import { BITRATE_PLAYER_ACTION_CONTROLS } from '../../contract'
  import { connectPlayer } from '../connect-player.svelte'
  import { parseControls } from '../lib/controls'
  import ActionButtons from '../parts/ActionButtons.svelte'

  /** `<bitrate-player-actions controls="like pip queue expand">` — narrowed by `controls`. */
  let { controls = null }: { controls?: string | null } = $props()

  const player = connectPlayer($host())
  const allowed = $derived(parseControls(controls, BITRATE_PLAYER_ACTION_CONTROLS))
</script>

{#if player.current}
  <div class="actions" part="actions">
    <ActionButtons controls={allowed} player={player.current} />
  </div>
{/if}

<style>
  :host {
    display: block;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
