<script lang="ts">
  let {
    trackTitle = '',
    artist = '',
  }: {
    trackTitle?: string
    artist?: string
  } = $props()
</script>

<span class="track-meta" part="meta">
  <span class="track-title" part="title">{trackTitle}</span>
  {#if artist}
    <span class="track-artist" part="artist">{artist}</span>
  {/if}
</span>

<style>
  .track-meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 0.125rem;
  }

  .track-title {
    font-size: var(--bitrate-player-title-size, 0.875rem);
    font-weight: 500;
    color: var(--color-text, var(--color-foreground, inherit));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .track-artist {
    font-size: var(--bitrate-player-artist-size, 0.75rem);
    color: var(--color-text-subdued, var(--color-muted-foreground, inherit));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
