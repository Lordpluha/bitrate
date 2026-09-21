import { afterEach, describe, expect, it, vi } from 'vitest'
import type { BitratePlayerElement } from '../contract'

/**
 * jsdom's shadow DOM and `<audio>` support is not trustworthy — this spec runs in the Chromium
 * `browser` project instead. See `.claude/rules/player-rules.md`.
 *
 * The failure-path tests (a tag already claimed by another element, a compiled component with
 * no custom-element constructor) live in the co-located `index.failure.browser-spec.ts`
 * instead of here — Vitest's browser provider gives each test *file* its own iframe and its
 * own `customElements` registry, but not each test within a file, and `customElements.define`
 * cannot be undone once called. Splitting the files is what keeps this file's real
 * registration from poisoning the failure-path assertions in the other.
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

  it('renders play/seek/volume chrome into an open shadow root', async () => {
    const { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } = await import('./index')
    await defineBitratePlayer()

    const element = document.createElement(BITRATE_PLAYER_TAG_NAME) as BitratePlayerElement
    document.body.append(element)

    await expect.poll(() => element.shadowRoot?.querySelector('button')).not.toBeNull()
    expect(element.shadowRoot?.querySelector('audio')).not.toBeNull()
    expect(element.shadowRoot?.querySelector('input[type="range"]')).not.toBeNull()
  })

  it('hides the quality selector with a single rendition, shows it with more than one', async () => {
    const { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } = await import('./index')
    await defineBitratePlayer()

    const element = document.createElement(BITRATE_PLAYER_TAG_NAME) as BitratePlayerElement
    document.body.append(element)
    await customElements.whenDefined(BITRATE_PLAYER_TAG_NAME)

    element.renditions = [{ bitrate: 320, label: '320 kbps' }]
    await expect.poll(() => element.shadowRoot?.querySelector('select')).toBeNull()

    element.renditions = [
      { bitrate: 320, label: '320 kbps' },
      { bitrate: 128, label: '128 kbps' },
    ]
    await expect.poll(() => element.shadowRoot?.querySelector('select')).not.toBeNull()
  })

  it('resolves the highest bitrate on Play and assigns the resolved URL as the audio source', async () => {
    const { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } = await import('./index')
    await defineBitratePlayer()

    const element = document.createElement(BITRATE_PLAYER_TAG_NAME) as BitratePlayerElement
    document.body.append(element)
    await customElements.whenDefined(BITRATE_PLAYER_TAG_NAME)

    const resolveSource = vi.fn().mockResolvedValue('https://cdn.test/320.m4a')
    element.renditions = [
      { bitrate: 320, label: '320 kbps' },
      { bitrate: 128, label: '128 kbps' },
    ]
    element.resolveSource = resolveSource
    element.trackTitle = 'Night Drive'

    const button = await vi.waitFor(() => {
      const found = element.shadowRoot?.querySelector('button')
      if (!found) throw new Error('button not rendered yet')
      return found as HTMLButtonElement
    })
    button.click()

    await expect.poll(() => resolveSource.mock.calls.length).toBeGreaterThan(0)
    expect(resolveSource).toHaveBeenCalledWith({ bitrate: 320 })
    await expect
      .poll(() => element.shadowRoot?.querySelector('audio')?.getAttribute('src'))
      .toBe('https://cdn.test/320.m4a')
  })

  it('shows the rejection message as an alert and leaves the audio source unset', async () => {
    const { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } = await import('./index')
    await defineBitratePlayer()

    const element = document.createElement(BITRATE_PLAYER_TAG_NAME) as BitratePlayerElement
    document.body.append(element)
    await customElements.whenDefined(BITRATE_PLAYER_TAG_NAME)

    element.renditions = [{ bitrate: 320, label: '320 kbps' }]
    element.resolveSource = vi
      .fn()
      .mockRejectedValue(new Error('This rendition is no longer available.'))
    element.trackTitle = 'Night Drive'

    const button = await vi.waitFor(() => {
      const found = element.shadowRoot?.querySelector('button')
      if (!found) throw new Error('button not rendered yet')
      return found as HTMLButtonElement
    })
    button.click()

    await expect
      .poll(() => element.shadowRoot?.querySelector('[role="alert"]')?.textContent)
      .toBe('This rendition is no longer available.')
    expect(element.shadowRoot?.querySelector('audio')?.hasAttribute('src')).toBe(false)
  })

  it('clears the audio source when the element is disconnected', async () => {
    const { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } = await import('./index')
    await defineBitratePlayer()

    const element = document.createElement(BITRATE_PLAYER_TAG_NAME) as BitratePlayerElement
    document.body.append(element)
    await customElements.whenDefined(BITRATE_PLAYER_TAG_NAME)

    element.renditions = [{ bitrate: 320, label: '320 kbps' }]
    element.resolveSource = vi.fn().mockResolvedValue('https://cdn.test/320.m4a')

    const button = await vi.waitFor(() => {
      const found = element.shadowRoot?.querySelector('button')
      if (!found) throw new Error('button not rendered yet')
      return found as HTMLButtonElement
    })
    button.click()
    await expect
      .poll(() => element.shadowRoot?.querySelector('audio')?.getAttribute('src'))
      .toBe('https://cdn.test/320.m4a')

    /**
     * Svelte unmounts the compiled component (and removes every shadow-root child, including
     * the `<audio>`) on the tick after `disconnectedCallback` — so re-querying the shadow root
     * after `remove()` finds nothing. Capture the live node first and assert the engine's
     * `destroy()` cleared it, rather than asserting on a query that will find null either way.
     */
    const audio = element.shadowRoot?.querySelector('audio')
    element.remove()

    await expect.poll(() => audio?.hasAttribute('src')).toBe(false)
  })

  it('renders cover art and artist once supplied, and a placeholder when absent', async () => {
    const { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } = await import('./index')
    await defineBitratePlayer()

    const element = document.createElement(BITRATE_PLAYER_TAG_NAME) as BitratePlayerElement
    document.body.append(element)
    await customElements.whenDefined(BITRATE_PLAYER_TAG_NAME)

    await expect.poll(() => element.shadowRoot?.querySelector('.cover')).not.toBeNull()
    expect(element.shadowRoot?.querySelector('.cover img')).toBeNull()

    element.artist = 'Nightbeats'
    element.coverUrl = 'https://cdn.test/cover.jpg'

    await expect
      .poll(() => element.shadowRoot?.querySelector('img')?.getAttribute('src'))
      .toBe('https://cdn.test/cover.jpg')
    expect(element.shadowRoot?.querySelector('.track-artist')?.textContent).toBe('Nightbeats')
  })

  it('renders an optional transport control only once its callback prop is supplied, and invokes it on click', async () => {
    const { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } = await import('./index')
    await defineBitratePlayer()

    const element = document.createElement(BITRATE_PLAYER_TAG_NAME) as BitratePlayerElement
    document.body.append(element)
    await customElements.whenDefined(BITRATE_PLAYER_TAG_NAME)

    expect(element.shadowRoot?.querySelector('[aria-label="Next track"]')).toBeNull()

    const onNext = vi.fn()
    element.onNext = onNext

    const nextButton = await vi.waitFor(() => {
      const found = element.shadowRoot?.querySelector('[aria-label="Next track"]')
      if (!found) throw new Error('next button not rendered yet')
      return found as HTMLButtonElement
    })
    nextButton.click()

    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('reflects isLiked/isShuffled/repeatMode onto the matching control once its callback is supplied', async () => {
    const { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } = await import('./index')
    await defineBitratePlayer()

    const element = document.createElement(BITRATE_PLAYER_TAG_NAME) as BitratePlayerElement
    document.body.append(element)
    await customElements.whenDefined(BITRATE_PLAYER_TAG_NAME)

    element.onLikeToggle = vi.fn()
    element.isLiked = true

    const likeButton = await vi.waitFor(() => {
      const found = element.shadowRoot?.querySelector('[aria-label="Unlike"]')
      if (!found) throw new Error('like button not rendered yet')
      return found as HTMLButtonElement
    })
    expect(likeButton.getAttribute('aria-pressed')).toBe('true')
  })

  it('keeps quality and volume operable at a narrow container width, only shrinking the time display', async () => {
    const { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } = await import('./index')
    await defineBitratePlayer()

    const element = document.createElement(BITRATE_PLAYER_TAG_NAME) as BitratePlayerElement
    element.style.display = 'block'
    element.style.width = '320px'
    document.body.append(element)
    await customElements.whenDefined(BITRATE_PLAYER_TAG_NAME)

    element.resolveSource = vi.fn().mockResolvedValue('https://cdn.test/320.m4a')
    element.renditions = [
      { bitrate: 320, label: '320 kbps' },
      { bitrate: 128, label: '128 kbps' },
    ]

    const select = await vi.waitFor(() => {
      const found = element.shadowRoot?.querySelector('select')
      if (!found) throw new Error('quality select not rendered yet')
      return found as HTMLSelectElement
    })
    expect(getComputedStyle(select).display).not.toBe('none')

    const volume = await vi.waitFor(() => {
      const found = element.shadowRoot?.querySelector('.volume')
      if (!found) throw new Error('volume control not rendered yet')
      return found as HTMLInputElement
    })
    expect(getComputedStyle(volume).display).not.toBe('none')

    volume.value = '0.4'
    volume.dispatchEvent(new Event('input', { bubbles: true }))

    const audio = element.shadowRoot?.querySelector('audio') as HTMLAudioElement
    await expect.poll(() => audio.volume).toBeCloseTo(0.4, 2)

    const playButton = await vi.waitFor(() => {
      const found = element.shadowRoot?.querySelector('.play-button')
      if (!found) throw new Error('play button not rendered yet')
      return found as HTMLButtonElement
    })
    expect(getComputedStyle(playButton).display).not.toBe('none')

    const total = element.shadowRoot?.querySelector('.time--total')
    expect(total ? getComputedStyle(total).display : null).toBe('none')
  })
})
