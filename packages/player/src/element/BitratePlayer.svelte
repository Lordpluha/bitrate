<svelte:options
  customElement={{
    shadow: 'open',
  }}
/>

<script lang="ts">
</script>

<!--
  Placeholder shell for `<bitrate-player>`. E1 replaces this with the real chrome; E0 only
  proves the element compiles, mounts into a shadow root, and is styled through inherited
  design-token custom properties rather than Tailwind (which cannot reach a shadow root).
-->
<div class="root">bitrate-player</div>

<style>
  .root {
    color: var(--color-foreground, inherit);
    background-color: var(--color-background, transparent);
    font-family: inherit;
  }
</style>
