<!--
  Never registered as a custom element — see `BitratePlayerHost.svelte`.
-->
<svelte:options customElement={{ props: {} }} />

<script lang="ts">
  /**
   * Story-only host that composes its own layout from part elements, the way a host page
   * builds a surface no built-in `chrome` covers. The layout CSS here is the host's own — the
   * parts only bring their content and the `--bitrate-player-*` properties.
   */
  import type { BitratePlayerElement } from '../../contract'
  import { defineBitratePlayer } from '../index'
  import type { BitratePlayerProps } from '../player-props'

  let props: BitratePlayerProps = $props()
  let element: BitratePlayerElement | undefined = $state(undefined)

  $effect(() => {
    if (!element) return
    for (const [key, value] of Object.entries(props)) {
      if (value !== undefined) Reflect.set(element, key, value)
    }
  })
</script>

{#await defineBitratePlayer() then}
  <bitrate-player bind:this={element} class="card">
    <bitrate-player-cover size="lg" class="art"></bitrate-player-cover>
    <bitrate-player-meta></bitrate-player-meta>
    <bitrate-player-seek variant="thin"></bitrate-player-seek>
    <div class="row">
      <bitrate-player-actions controls="like"></bitrate-player-actions>
      <bitrate-player-transport controls="prev play next"></bitrate-player-transport>
      <bitrate-player-actions controls="queue"></bitrate-player-actions>
    </div>
    <bitrate-player-error></bitrate-player-error>
  </bitrate-player>
{/await}

<style>
  .card {
    --bitrate-player-play-size: 2.75rem;

    display: grid;
    gap: 0.75rem;
    width: 16rem;
    padding: 1rem;
    border-radius: 1rem;
    background: var(--color-surface, rgba(128, 128, 128, 0.12));
  }

  .art {
    aspect-ratio: 1;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
