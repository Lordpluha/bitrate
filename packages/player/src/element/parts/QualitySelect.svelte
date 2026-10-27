<script lang="ts">
  import { AUTO_QUALITY } from '../create-controller'
  import type { PlayerController } from '../player-controller'

  let { player }: { player: PlayerController } = $props()
</script>

<label class="quality" part="quality">
  {player.labels.quality}
  <select
    disabled={player.preparing}
    onchange={player.changeQuality}
    value={player.autoQuality ? AUTO_QUALITY : player.effectiveBitrate}
  >
    {#if player.autoQuality !== null}
      <option value={AUTO_QUALITY}>{player.labels.qualityAuto}</option>
    {/if}
    {#each player.renditions as rendition (rendition.bitrate)}
      <option value={rendition.bitrate}>{rendition.label}</option>
    {/each}
  </select>
</label>

<style>
  .quality {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    color: var(--color-text-subdued, var(--color-muted-foreground, inherit));
  }

  .quality select {
    border-radius: 0.375rem;
    border: 1px solid var(--color-border, currentColor);
    background-color: var(--color-background, transparent);
    color: var(--color-text, var(--color-foreground, inherit));
    padding: 0.125rem 0.375rem;
    font: inherit;
  }

  @container bitrate-player (max-width: 36rem) {
    .quality {
      flex: 1 1 100%;
    }
  }
</style>
