<script lang="ts">
  import ExpandIcon from '../icons/ExpandIcon.svelte'
  import QueueIcon from '../icons/QueueIcon.svelte'
  import IconButton from './IconButton.svelte'

  let {
    onQueueOpen = null,
    onExpand = null,
  }: {
    onQueueOpen?: (() => void) | null
    onExpand?: (() => void) | null
  } = $props()
</script>

{#if onQueueOpen}
  <IconButton label="Open queue" onClick={onQueueOpen}>
    <QueueIcon />
  </IconButton>
{/if}

{#if onExpand}
  <IconButton label="Open full player" onClick={onExpand}>
    <ExpandIcon />
  </IconButton>
{/if}
