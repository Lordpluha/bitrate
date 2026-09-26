<script lang="ts">
  import HeartIcon from '../icons/HeartIcon.svelte'
  import PipIcon from '../icons/PipIcon.svelte'
  import IconButton from './IconButton.svelte'

  type TrackMetaLike = {
    active: boolean
    onToggle: (() => void) | null
  }

  let {
    coverUrl = '',
    trackTitle = '',
    artist = '',
    like,
    onPictureInPicture = null,
  }: {
    coverUrl?: string
    trackTitle?: string
    artist?: string
    like: TrackMetaLike
    onPictureInPicture?: (() => void) | null
  } = $props()
</script>

<div class="track">
  <span class="cover" class:cover--empty={!coverUrl}>
    {#if coverUrl}
      <img alt="" class="cover-img" src={coverUrl} />
    {/if}
  </span>

  <span class="track-meta">
    <span class="track-title">{trackTitle}</span>
    {#if artist}
      <span class="track-artist">{artist}</span>
    {/if}
  </span>

  {#if like.onToggle}
    <IconButton
      active={like.active}
      label={like.active ? 'Unlike' : 'Like'}
      onClick={like.onToggle}
      pressed={like.active}
    >
      <HeartIcon filled={like.active} />
    </IconButton>
  {/if}

  {#if onPictureInPicture}
    <IconButton label="Open floating player" onClick={onPictureInPicture}>
      <PipIcon />
    </IconButton>
  {/if}
</div>

<style>
  .track {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
    flex: 1 1 25%;
  }

  .cover {
    display: block;
    flex-shrink: 0;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 0.25rem;
    overflow: hidden;
    background-color: var(--color-surface, rgba(128, 128, 128, 0.16));
  }

  .cover-img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .track-meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 0.125rem;
  }

  .track-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text, var(--color-foreground, inherit));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .track-artist {
    font-size: 0.75rem;
    color: var(--color-text-subdued, var(--color-muted-foreground, inherit));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @container bitrate-player (max-width: 36rem) {
    .track {
      flex: 1 1 auto;
      order: 1;
    }
  }
</style>
