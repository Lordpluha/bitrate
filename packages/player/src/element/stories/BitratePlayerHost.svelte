<!--
  Never registered as a custom element. The package compiles every component with
  `customElement: true` (svelte.config.js); an empty `props` map tells the compiler this
  wrapper forwards its props as a whole instead of exposing them as element properties.
-->
<svelte:options customElement={{ props: {} }} />

<script lang="ts">
  /**
   * Story-only host for `<bitrate-player>`. Storybook's Svelte renderer mounts Svelte
   * components, but the element under review is the registered custom element — `$host()`
   * only exists there. This renders the real tag and assigns every arg as a DOM property, the
   * way a host page does (arrays and callbacks cannot cross the attribute boundary).
   *
   * The tag is rendered only after `defineBitratePlayer()` resolves: properties set on an
   * element before it upgrades are not guaranteed to survive (see `BitratePlayerElement`).
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
  <bitrate-player bind:this={element}></bitrate-player>
{/await}
