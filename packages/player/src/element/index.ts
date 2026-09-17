import type { Component } from 'svelte'

/** The custom element tag name registered by this package. */
export const BITRATE_PLAYER_TAG_NAME = 'bitrate-player'

/**
 * A Svelte component compiled with the `customElement` compiler option exposes a static
 * `element` constructor. `svelte-check` resolves this from the real `.svelte` source; plain
 * `tsc` (used by `vite-plugin-dts`) only sees the generic `*.svelte` ambient module shim
 * Svelte ships, which does not carry it — so the accurate shape is asserted once, here.
 */
type CompiledCustomElement = Component<Record<string, never>> & {
  element?: typeof HTMLElement
}

/**
 * Shared in-flight registration promise. Concurrent callers (e.g. two hosts importing
 * `@bitrate/player` from separate entry chunks) await the same dynamic import instead of
 * racing two `customElements.define` calls.
 */
let registration: Promise<void> | null = null

/**
 * Registers `<bitrate-player>` against the document's custom element registry.
 *
 * The compiled Svelte component (`BitratePlayer.svelte`) calls `customElements`-adjacent
 * runtime machinery — `svelte/internal/client`'s `create_custom_element` — at module
 * evaluation time, which extends `HTMLElement`. `HTMLElement` does not exist in a server
 * bundle (Next.js, Nitro), so that module can never be imported eagerly: it is loaded with a
 * dynamic `import()`, and only once a real custom-element registry exists to receive it.
 *
 * Guarded so it is safe to call from anywhere, any number of times, concurrently:
 *
 * - `typeof customElements === 'undefined'` — resolves immediately under SSR, without ever
 *   importing the Svelte component module.
 * - `customElements.get(BITRATE_PLAYER_TAG_NAME)` — resolves immediately if the tag is
 *   already defined, so a second import (e.g. from two separate entry chunks) never throws
 *   `NotSupportedError` from a duplicate `define`.
 * - A shared in-flight promise — concurrent callers await the same dynamic import rather than
 *   each starting (and racing) their own.
 *
 * Importing `@bitrate/player` also calls this as a side effect; call it directly only when a
 * host wants to control the timing of registration explicitly, or wants to await the moment
 * registration actually completes (e.g. before reading a property that only exists once the
 * element upgrades). A host that only needs to *wait* for registration — without triggering
 * it — can use the platform's own `customElements.whenDefined(BITRATE_PLAYER_TAG_NAME)`
 * instead.
 *
 * @returns A promise that resolves once `<bitrate-player>` is defined (or immediately, if
 * there is no registry to define it against, or it is already defined). Rejects if the
 * compiled component module fails to load or does not expose a custom-element constructor —
 * the failure is also logged, so a host that fires this without awaiting it still sees it.
 */
export function defineBitratePlayer(): Promise<void> {
  if (typeof customElements === 'undefined') {
    return Promise.resolve()
  }

  if (customElements.get(BITRATE_PLAYER_TAG_NAME)) {
    return Promise.resolve()
  }

  if (registration) {
    return registration
  }

  registration = import('./BitratePlayer.svelte')
    .then((module) => {
      if (customElements.get(BITRATE_PLAYER_TAG_NAME)) {
        return
      }

      const { element } = module.default as CompiledCustomElement
      if (!element) {
        throw new Error(
          `@bitrate/player: the compiled component for <${BITRATE_PLAYER_TAG_NAME}> exposes no custom-element constructor — check that BitratePlayer.svelte declares <svelte:options customElement={{ ... }}> and that the "customElement" compiler flag is enabled.`,
        )
      }

      customElements.define(BITRATE_PLAYER_TAG_NAME, element as CustomElementConstructor)
    })
    .catch((error: unknown) => {
      registration = null
      console.error(`@bitrate/player: failed to register <${BITRATE_PLAYER_TAG_NAME}>`, error)
      throw error
    })

  return registration
}

defineBitratePlayer().catch(() => {
  /** Already logged above; swallow here so the side-effect call at import time never
   *  surfaces as an unhandled rejection. A host calling `defineBitratePlayer()` directly
   *  still gets the rejected promise. */
})
