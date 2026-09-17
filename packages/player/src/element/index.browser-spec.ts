import { afterEach, describe, expect, it } from 'vitest'

/**
 * jsdom's shadow DOM and `<audio>` support is not trustworthy — this spec runs in the Chromium
 * `browser` project instead. See `.claude/rules/player-rules.md`.
 *
 * The failure-path tests (a tag already claimed by another element, a compiled component with
 * no custom-element constructor) live in the co-located `index.failure.browser-spec.ts`
 * instead of here — Vitest's browser provider gives each test *file* its own iframe and its
 * own `customElements` registry, but not each test within a file, and `customElements.define`
 * cannot be undone once called. Splitting the files is what keeps this file's two real
 * registrations from poisoning the failure-path assertions in the other.
 */
describe('<bitrate-player>', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it('registers the tag exactly once, even if define is called again', async () => {
    const { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } = await import('./index')

    await defineBitratePlayer()
    await defineBitratePlayer()

    expect(customElements.get(BITRATE_PLAYER_TAG_NAME)).toBeDefined()
  })

  it('renders its placeholder text into an open shadow root', async () => {
    const { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } = await import('./index')
    await defineBitratePlayer()

    const element = document.createElement(BITRATE_PLAYER_TAG_NAME)
    document.body.append(element)

    await expect.poll(() => element.shadowRoot?.textContent).toContain('bitrate-player')
    expect(element.shadowRoot).not.toBeNull()
  })
})
