<script lang="ts">
  import { BITRATE_PLAYER_TRANSPORT_CONTROLS } from '../../contract'
  import ActionButtons from '../parts/ActionButtons.svelte'
  import ErrorMessage from '../parts/ErrorMessage.svelte'
  import QualitySelect from '../parts/QualitySelect.svelte'
  import SeekBar from '../parts/SeekBar.svelte'
  import TrackMeta from '../parts/TrackMeta.svelte'
  import TransportControls from '../parts/TransportControls.svelte'
  import VolumeControl from '../parts/VolumeControl.svelte'
  import type { PlayerController } from '../player-controller'

  /** The default chrome: the horizontal desktop bar, every control the host supplies. */
  let { player }: { player: PlayerController } = $props()
</script>

<div class="root" part="layout">
  <TrackMeta {player} />

  <div class="transport">
    <TransportControls controls={BITRATE_PLAYER_TRANSPORT_CONTROLS} {player} />
    <SeekBar {player} />
  </div>

  <div class="actions">
    {#if player.showQuality}
      <QualitySelect {player} />
    {/if}
    <VolumeControl {player} />
    <ActionButtons controls={['queue', 'expand']} {player} />
  </div>

  <div class="error">
    <ErrorMessage {player} />
  </div>
</div>

<style>
  .root {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    color: var(--color-text, var(--color-foreground, inherit));
    background-color: var(--bitrate-player-background, var(--color-background, transparent));
    border-top: 1px solid var(--color-border, currentColor);
    font-family: inherit;
    position: relative;
  }

  .transport {
    display: flex;
    flex: 2 1 40%;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
    max-width: 45rem;
  }

  .actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    flex: 1 1 35%;
    min-width: 0;
  }

  .error {
    position: absolute;
    left: 1rem;
    bottom: 100%;
    margin: 0 0 0.25rem;
  }

  @container bitrate-player (max-width: 36rem) {
    /** Quality and volume stay reachable at every width; only the total-duration readout shrinks. */
    .root {
      flex-wrap: wrap;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
    }

    .transport {
      order: 3;
      flex: 1 1 100%;
      max-width: none;
    }

    .actions {
      order: 2;
      flex: 1 1 100%;
      flex-wrap: wrap;
      justify-content: flex-start;
    }
  }
</style>
