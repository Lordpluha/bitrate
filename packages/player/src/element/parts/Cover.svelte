<script lang="ts">
  import type { BitratePlayerCoverSize } from '../../contract'

  let {
    coverUrl = '',
    size = 'md',
  }: {
    coverUrl?: string
    size?: BitratePlayerCoverSize
  } = $props()
</script>

<span class="cover cover--{size}" class:cover--empty={!coverUrl} part="cover">
  {#if coverUrl}
    <img alt="" class="cover-img" src={coverUrl} />
  {/if}
</span>

<style>
  .cover {
    display: block;
    flex-shrink: 0;
    width: var(--bitrate-player-cover-size, 3.5rem);
    height: var(--bitrate-player-cover-size, 3.5rem);
    border-radius: var(--bitrate-player-cover-radius, 0.25rem);
    overflow: hidden;
    background-color: var(--color-surface, rgba(128, 128, 128, 0.16));
  }

  .cover--sm {
    width: var(--bitrate-player-cover-size, 2.5rem);
    height: var(--bitrate-player-cover-size, 2.5rem);
  }

  .cover--lg {
    width: var(--bitrate-player-cover-size, 100%);
    height: var(--bitrate-player-cover-size, 100%);
  }

  .cover-img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
