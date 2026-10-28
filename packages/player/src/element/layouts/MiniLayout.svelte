<script lang="ts">
  import Cover from '../parts/Cover.svelte'
  import ErrorMessage from '../parts/ErrorMessage.svelte'
  import SeekBar from '../parts/SeekBar.svelte'
  import TrackText from '../parts/TrackText.svelte'
  import TransportControls from '../parts/TransportControls.svelte'
  import type { PlayerController } from '../player-controller'

  /** A compact mobile row: cover, title, Play and Next, a hairline of progress along the edge. */
  let { player }: { player: PlayerController } = $props()
</script>

<div class="mini" part="layout">
  <Cover coverUrl={player.coverUrl} size="sm" />
  <div class="text">
    <TrackText artist={player.artist} trackTitle={player.trackTitle} />
    <ErrorMessage {player} />
  </div>
  <TransportControls controls={['play', 'next']} {player} />
  <div class="progress">
    <SeekBar {player} variant="thin" />
  </div>
</div>

<style>
  .mini {
    --bitrate-player-transport-gap: 0.25rem;
    --bitrate-player-play-size: 2.25rem;

    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem 0.75rem;
    color: var(--color-text, var(--color-foreground, inherit));
    background-color: var(--bitrate-player-background, var(--color-surface, transparent));
    border-radius: var(--bitrate-player-radius, 0.75rem);
    overflow: hidden;
  }

  .text {
    flex: 1 1 auto;
    min-width: 0;
  }

  .progress {
    position: absolute;
    left: 0.75rem;
    right: 0.75rem;
    bottom: 0.25rem;
    display: flex;
  }
</style>
