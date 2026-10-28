<script lang="ts">
  import Cover from '../parts/Cover.svelte'
  import ErrorMessage from '../parts/ErrorMessage.svelte'
  import SeekBar from '../parts/SeekBar.svelte'
  import TrackText from '../parts/TrackText.svelte'
  import TransportControls from '../parts/TransportControls.svelte'
  import type { PlayerController } from '../player-controller'

  /** The small picture-in-picture window: art as the backdrop, Previous/Play/Next over a scrim. */
  let { player }: { player: PlayerController } = $props()
</script>

<div class="floating" part="layout">
  <div class="backdrop">
    <Cover coverUrl={player.coverUrl} size="lg" />
  </div>

  <div class="content">
    <TrackText artist={player.artist} trackTitle={player.trackTitle} />
    <ErrorMessage {player} />
    <TransportControls controls={['prev', 'play', 'next']} {player} />
    <SeekBar {player} variant="thin" />
  </div>
</div>

<style>
  .floating {
    --bitrate-player-cover-radius: 0;
    --bitrate-player-play-size: 3rem;
    --bitrate-player-play-icon-scale: 1.3;
    --bitrate-player-transport-gap: 1.25rem;

    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    min-height: var(--bitrate-player-floating-min-height, 12rem);
    height: 100%;
    box-sizing: border-box;
    border-radius: var(--bitrate-player-radius, 0.75rem);
    overflow: hidden;
    color: var(--color-text, var(--color-foreground, inherit));
    background-color: var(--bitrate-player-background, var(--color-surface, transparent));
  }

  .backdrop {
    position: absolute;
    inset: 0;
  }

  /** Keeps the controls legible over any cover art. */
  .backdrop::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      var(--bitrate-player-scrim, rgba(0, 0, 0, 0.78)) 15%,
      rgba(0, 0, 0, 0.15) 70%
    );
  }

  /** Over the scrim the page's theme no longer applies — the controls always sit on dark art. */
  .content {
    --color-text: var(--bitrate-player-on-media, white);
    --color-foreground: var(--bitrate-player-on-media, white);
    --color-text-subdued: var(--bitrate-player-on-media-subdued, rgba(255, 255, 255, 0.72));
    --color-muted-foreground: var(--bitrate-player-on-media-subdued, rgba(255, 255, 255, 0.72));
    --color-background: var(--bitrate-player-scrim, rgba(0, 0, 0, 0.78));
    --color-border: rgba(255, 255, 255, 0.3);

    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
  }
</style>
