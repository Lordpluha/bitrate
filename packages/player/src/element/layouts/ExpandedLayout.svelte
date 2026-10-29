<script lang="ts">
  import { BITRATE_PLAYER_TRANSPORT_CONTROLS } from '../../contract'
  import ActionButtons from '../parts/ActionButtons.svelte'
  import Cover from '../parts/Cover.svelte'
  import ErrorMessage from '../parts/ErrorMessage.svelte'
  import QualitySelect from '../parts/QualitySelect.svelte'
  import SeekBar from '../parts/SeekBar.svelte'
  import TrackText from '../parts/TrackText.svelte'
  import TransportControls from '../parts/TransportControls.svelte'
  import VolumeControl from '../parts/VolumeControl.svelte'
  import type { PlayerController } from '../player-controller'

  /** The full-screen now-playing view: large art, large transport, volume and actions below. */
  let { player }: { player: PlayerController } = $props()
</script>

<div class="expanded" part="layout">
  <div class="art">
    <Cover coverUrl={player.coverUrl} size="lg" />
  </div>

  <div class="heading">
    <TrackText artist={player.artist} trackTitle={player.trackTitle} />
    <ActionButtons controls={['like']} {player} />
  </div>

  <SeekBar keepTotal {player} />
  <TransportControls controls={BITRATE_PLAYER_TRANSPORT_CONTROLS} {player} />
  <ErrorMessage {player} />

  <div class="footer">
    <div class="volume">
      <VolumeControl {player} />
    </div>
    {#if player.showQuality}
      <QualitySelect {player} />
    {/if}
    <div class="extras">
      <ActionButtons controls={['pip', 'queue']} {player} />
    </div>
  </div>
</div>

<style>
  .expanded {
    --bitrate-player-cover-radius: 0.75rem;
    --bitrate-player-title-size: 1.5rem;
    --bitrate-player-artist-size: 1rem;
    --bitrate-player-play-size: 4rem;
    --bitrate-player-play-icon-scale: 1.6;
    --bitrate-player-icon-button-size: 2.75rem;
    --bitrate-player-icon-scale: 1.25;
    --bitrate-player-transport-gap: 1.5rem;

    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
    max-width: 28rem;
    margin-inline: auto;
    padding: 2rem 1.5rem;
    box-sizing: border-box;
    color: var(--color-text, var(--color-foreground, inherit));
    background-color: var(--bitrate-player-background, transparent);
  }

  .art {
    align-self: center;
    width: min(100%, 20rem);
    aspect-ratio: 1;
    box-shadow: 0 1.5rem 3rem rgba(0, 0, 0, 0.35);
    border-radius: 0.75rem;
  }

  .heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-width: 0;
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .volume,
  .extras {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
