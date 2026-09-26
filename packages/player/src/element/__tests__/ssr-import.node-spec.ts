import { describe, expect, it } from 'vitest'

/**
 * Runs in the `node` Vitest project — a true server environment with no DOM and no
 * `customElements` registry, unlike jsdom (which partially implements custom elements and
 * would hide this failure). Proves `@bitrate/player`'s default and `/element` entries are
 * safe to import from a server bundle (Next.js, Nitro), the scenario B1 broke: the compiled
 * Svelte component called `customElements`-adjacent runtime machinery at module evaluation
 * time, throwing `TypeError: Class extends value undefined is not a constructor or null`
 * before `defineBitratePlayer()`'s SSR guard ever ran. See `.claude/rules/player-rules.md`.
 */
describe('server-side import', () => {
  it('has no customElements registry in this environment (sanity check for the rest of this file)', () => {
    expect(typeof customElements).toBe('undefined')
  })

  it('does not throw importing the element entry with no customElements registry', async () => {
    await expect(import('../index')).resolves.toBeDefined()
  })

  it('does not throw importing the package default entry with no customElements registry', async () => {
    await expect(import('../../index')).resolves.toBeDefined()
  })

  it('exposes the tag name and the registration function without registering anything', async () => {
    const { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } = await import('../index')

    expect(BITRATE_PLAYER_TAG_NAME).toBe('bitrate-player')
    expect(typeof defineBitratePlayer).toBe('function')
  })

  it('resolves defineBitratePlayer() without registering, since there is no registry to register against', async () => {
    const { defineBitratePlayer } = await import('../index')

    await expect(defineBitratePlayer()).resolves.toBeUndefined()
  })
})
