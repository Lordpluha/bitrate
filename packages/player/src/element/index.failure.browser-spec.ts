import { describe, expect, it, vi } from 'vitest'

/**
 * The two failure paths of `defineBitratePlayer()`, split from `index.browser-spec.ts` so
 * each keeps its own fresh `customElements` registry (see that file's doc comment for why).
 * Order matters within this file: the mocked-component test runs first, while the tag is
 * still unclaimed in this file's registry, and the already-claimed test claims it itself
 * second — nothing else in this file claims it before that point.
 */
vi.mock('./BitratePlayer.svelte', () => ({ default: {} }))

describe('<bitrate-player> failure paths', () => {
  it('rejects and logs when the compiled component exposes no custom-element constructor', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { defineBitratePlayer } = await import('./index')

    await expect(defineBitratePlayer()).rejects.toThrow('exposes no custom-element constructor')
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('failed to register'),
      expect.anything(),
    )

    consoleError.mockRestore()
  })

  it('does not throw or register anything if the tag is already claimed by another element', async () => {
    const { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } = await import('./index')
    class Impostor extends HTMLElement {}
    customElements.define(BITRATE_PLAYER_TAG_NAME, Impostor)

    await expect(defineBitratePlayer()).resolves.toBeUndefined()
    expect(customElements.get(BITRATE_PLAYER_TAG_NAME)).toBe(Impostor)
  })
})
