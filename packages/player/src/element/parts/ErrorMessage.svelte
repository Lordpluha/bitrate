<script lang="ts">
  import type { PlayerController } from '../player-controller'

  let { player }: { player: PlayerController } = $props()
</script>

{#if player.error}
  <p class="error" part="error" role="alert">{player.error.message}</p>
{/if}

<style>
  .error {
    margin: 0;
    color: var(--color-destructive, crimson);
    font-size: 0.75rem;
  }
</style>
