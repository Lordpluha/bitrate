<script lang="ts">
  import type { PlayerController } from '../player-controller'
  import ActionButtons from './ActionButtons.svelte'
  import Cover from './Cover.svelte'
  import TrackText from './TrackText.svelte'

  let { player }: { player: PlayerController } = $props()
</script>

<div class="track">
  <Cover coverUrl={player.coverUrl} />
  <TrackText artist={player.artist} trackTitle={player.trackTitle} />
  <ActionButtons controls={['like', 'pip']} {player} />
</div>

<style>
  .track {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
    flex: 1 1 25%;
  }

  @container bitrate-player (max-width: 36rem) {
    .track {
      flex: 1 1 auto;
      order: 1;
    }
  }
</style>
