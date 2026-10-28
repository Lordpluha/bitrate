<script lang="ts">
  import type { PlayerChrome } from '../../contract'
  import type { PlayerController } from '../player-controller'
  import BarLayout from './BarLayout.svelte'
  import ExpandedLayout from './ExpandedLayout.svelte'
  import FloatingLayout from './FloatingLayout.svelte'
  import MiniLayout from './MiniLayout.svelte'

  /** The built-in layout for `chrome`; `none` renders nothing. */
  let { chrome, player }: { chrome: PlayerChrome; player: PlayerController } = $props()
</script>

{#if chrome === 'bar'}
  <BarLayout {player} />
{:else if chrome === 'mini'}
  <MiniLayout {player} />
{:else if chrome === 'expanded'}
  <ExpandedLayout {player} />
{:else if chrome === 'floating'}
  <FloatingLayout {player} />
{/if}
