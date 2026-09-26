<script lang="ts">
  let { repeatOne = false }: { repeatOne?: boolean } = $props()
</script>

<svg
  aria-hidden="true"
  fill="none"
  height="16"
  stroke="currentColor"
  stroke-linecap="round"
  stroke-linejoin="round"
  stroke-width="2"
  viewBox="0 0 24 24"
  width="16"
>
  <path d="m17 2 4 4-4 4" />
  <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
  <path d="m7 22-4-4 4-4" />
  <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  {#if repeatOne}
    <path d="M11 10h1v4" />
  {/if}
</svg>
