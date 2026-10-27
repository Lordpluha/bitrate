import { afterEach, describe, expect, it, vi } from 'vitest'
import type {
  BitratePlayerElement,
  BitratePlayerSource,
  BitratePlayerStateDetail,
  BitratePlayerStreaming,
} from '../contract'
import { resolveSilentSource } from './stories/fixtures'

/**
 * Streaming mode against real media in Chromium: tracks without a manifest play from their
 * progressive file (an in-memory one-second silent WAV), which exercises the two-slot logic —
 * prefetch, the instant switch and `ended` — without a CMAF fixture.
 */
const silentUrl = () => resolveSilentSource({ bitrate: null })

const source = async (key: string): Promise<BitratePlayerSource> => ({
  key,
  trackId: key,
  progressiveUrl: await silentUrl(),
})

const streaming = (): BitratePlayerStreaming => ({
  fetchRange: vi.fn(),
  resolveManifest: vi.fn(async () => null),
})

async function mountStreaming(): Promise<BitratePlayerElement> {
  const { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } = await import('./index')
  await defineBitratePlayer()
  const element = document.createElement(BITRATE_PLAYER_TAG_NAME)
  element.chrome = 'none'
  document.body.append(element)
  element.streaming = streaming()
  await expect.poll(() => element.shadowRoot?.querySelectorAll('audio').length).toBe(2)
  return element
}

const audios = (element: BitratePlayerElement) => [
  ...(element.shadowRoot?.querySelectorAll('audio') ?? []),
]

describe('<bitrate-player> streaming mode', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it('accepts play() and pause() straight after streaming is assigned, and keeps the last intent', async () => {
    const { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } = await import('./index')
    await defineBitratePlayer()
    const playable = await source('k1')
    const element = document.createElement(BITRATE_PLAYER_TAG_NAME)
    element.chrome = 'none'
    document.body.append(element)

    /** No await from here: the component mounts a microtask after the element connects. */
    element.streaming = streaming()
    element.source = playable
    expect(() => element.pause()).not.toThrow()
    void element.play()

    await expect.poll(() => element.state.status).toBe('playing')
  })

  it('plays the source and reports its state with the play key', async () => {
    const element = await mountStreaming()
    const states: BitratePlayerStateDetail[] = []
    element.addEventListener('statechange', (event) => {
      states.push((event as CustomEvent<BitratePlayerStateDetail>).detail)
    })
    const played = vi.fn()
    element.addEventListener('play', played)

    element.source = await source('k1')
    await element.play()

    await expect.poll(() => played.mock.calls.length).toBeGreaterThan(0)
    await expect.poll(() => element.state.key).toBe('k1')
    expect(states.some((state) => state.key === 'k1')).toBe(true)
  })

  it('prefetches next into the standby element and switches to it at once', async () => {
    const element = await mountStreaming()
    element.source = await source('k1')
    element.next = await source('k2')

    /** A paused one-second track is already within 45 s of its end, so next prefetches. */
    await expect.poll(() => audios(element)[1]?.getAttribute('src')).toBeTruthy()

    element.source = await source('k2')
    await element.play()

    await expect.poll(() => element.state.key).toBe('k2')
    await expect.poll(() => audios(element)[1]?.paused).toBe(false)
  })

  it('reports ended with the key of the play that finished', async () => {
    const element = await mountStreaming()
    const ended = vi.fn()
    element.addEventListener('ended', (event) => ended((event as CustomEvent).detail))

    element.source = await source('k1')
    await element.play()

    await expect.poll(() => ended.mock.calls.length, { timeout: 5_000 }).toBe(1)
    expect(ended).toHaveBeenCalledWith({ key: 'k1' })
  })

  it('seeks through the host method', async () => {
    const element = await mountStreaming()
    element.source = await source('k1')
    await expect.poll(() => element.state.duration).toBeGreaterThan(0)

    element.seek(0.5)

    await expect.poll(() => audios(element)[0]?.currentTime).toBeCloseTo(0.5, 1)
  })

  it('lets a mirror render and drive the root it mirrors', async () => {
    const primary = await mountStreaming()
    primary.source = await source('k1')
    primary.trackTitle = 'Night Drive'
    primary.labels = { play: (title) => `Play "${title}"` }

    const mirror = document.createElement('bitrate-player')
    mirror.innerHTML = '<bitrate-player-transport controls="play"></bitrate-player-transport>'
    document.body.append(mirror)
    mirror.mirror = primary

    const play = await vi.waitFor(() => {
      const button = mirror
        .querySelector('bitrate-player-transport')
        ?.shadowRoot?.querySelector('.play-button')
      if (!(button instanceof HTMLButtonElement) || button.disabled) {
        throw new Error('mirrored play button not ready')
      }
      return button
    })
    expect(play.getAttribute('aria-label')).toBe('Play "Night Drive"')
    play.click()

    await expect.poll(() => primary.state.status).toBe('playing')
    expect(mirror.shadowRoot?.querySelectorAll('audio')).toHaveLength(1)
  })
})
