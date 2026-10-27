<script lang="ts">
  import type { BitratePlayerActionControl } from '../../contract'
  import ExpandIcon from '../icons/ExpandIcon.svelte'
  import HeartIcon from '../icons/HeartIcon.svelte'
  import PipIcon from '../icons/PipIcon.svelte'
  import QueueIcon from '../icons/QueueIcon.svelte'
  import type { PlayerController } from '../player-controller'
  import IconButton from './IconButton.svelte'

  /** A control renders only when it is in `controls` and the root has its callback. */
  let {
    player,
    controls,
  }: {
    player: PlayerController
    controls: readonly BitratePlayerActionControl[]
  } = $props()

  const like = $derived(controls.includes('like') ? player.callbacks.onLikeToggle : null)
  const pip = $derived(controls.includes('pip') ? player.callbacks.onPictureInPicture : null)
  const queue = $derived(controls.includes('queue') ? player.callbacks.onQueueOpen : null)
  const expand = $derived(controls.includes('expand') ? player.callbacks.onExpand : null)
</script>

{#if like}
  <IconButton
    active={player.isLiked}
    label={player.isLiked ? 'Unlike' : 'Like'}
    onClick={like}
    pressed={player.isLiked}
  >
    <HeartIcon filled={player.isLiked} />
  </IconButton>
{/if}

{#if pip}
  <IconButton label="Open floating player" onClick={pip}>
    <PipIcon />
  </IconButton>
{/if}

{#if queue}
  <IconButton label="Open queue" onClick={queue}>
    <QueueIcon />
  </IconButton>
{/if}

{#if expand}
  <IconButton label="Open full player" onClick={expand}>
    <ExpandIcon />
  </IconButton>
{/if}
