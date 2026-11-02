import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { BitratePlayerElement } from '../contract'
import { NATIVE_ONLY_MANIFEST, resolveSilentSource } from './stories/fixtures'

/**
 * The lock-screen / OS media controls. Chromium's real `navigator.mediaSession` cannot report
 * the handlers it holds, so a recording stand-in replaces it for these cases.
 */
type Handler = (details: MediaSessionActionDetails) => void

const fakeSession = () => {
  const handlers = new Map<MediaSessionAction, Handler | null>()
  return {
    handlers,
    metadata: null as MediaMetadata | null,
    playbackState: 'none' as MediaSessionPlaybackState,
    positions: [] as MediaPositionState[],
    setActionHandler(action: MediaSessionAction, handler: Handler | null) {
      handlers.set(action, handler)
    },
    setPositionState(state: MediaPositionState) {
      this.positions.push(state)
    },
  }
}

let session: ReturnType<typeof fakeSession>

async function mountPlayer(mediaSession: boolean): Promise<BitratePlayerElement> {
  const { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } = await import('./index')
  await defineBitratePlayer()
  const element = document.createElement(BITRATE_PLAYER_TAG_NAME)
  element.chrome = 'none'
  element.mediaSession = mediaSession
  document.body.append(element)
  element.trackTitle = 'Night Drive'
  element.artist = 'Neon Avenue'
  element.coverUrl = 'https://cdn.test/cover.jpg'
  element.onNext = vi.fn()
  const silent = await resolveSilentSource({ bitrate: null })
  element.streaming = {
    fetchRange: vi.fn(),
    renditionUrl: () => silent,
    resolveManifest: vi.fn(async () => NATIVE_ONLY_MANIFEST),
  }
  element.source = { key: 'k1', trackId: 'k1' }
  await expect.poll(() => element.shadowRoot?.querySelectorAll('audio').length).toBe(2)
  return element
}

const run = (action: MediaSessionAction, details: Partial<MediaSessionActionDetails> = {}) => {
  const handler = session.handlers.get(action)
  if (!handler) throw new Error(`no ${action} handler`)
  handler({ action, ...details })
}

describe('<bitrate-player media-session>', () => {
  beforeEach(() => {
    session = fakeSession()
    Object.defineProperty(navigator, 'mediaSession', { configurable: true, value: session })
  })

  afterEach(() => {
    document.body.replaceChildren()
    Reflect.deleteProperty(navigator, 'mediaSession')
  })

  it('shows the track on the OS controls', async () => {
    await mountPlayer(true)

    await expect.poll(() => session.metadata?.title).toBe('Night Drive')
    expect(session.metadata?.artist).toBe('Neon Avenue')
    expect(session.metadata?.artwork[0]?.src).toBe('https://cdn.test/cover.jpg')
  })

  it('answers the media keys and reports playback and position', async () => {
    const element = await mountPlayer(true)
    await expect.poll(() => session.handlers.get('play')).toBeTypeOf('function')

    run('play')
    await expect.poll(() => element.state.status).toBe('playing')
    await expect.poll(() => session.playbackState).toBe('playing')
    await expect.poll(() => session.positions.length).toBeGreaterThan(0)

    run('seekto', { seekTime: 0.5 })
    await expect.poll(() => element.state.currentTime).toBeGreaterThanOrEqual(0.5)

    run('nexttrack')
    expect(element.onNext).toHaveBeenCalledTimes(1)
    expect(session.handlers.get('previoustrack')).toBeNull()

    run('pause')
    await expect.poll(() => session.playbackState).toBe('paused')
  })

  it('leaves the session alone unless asked, and clears it when turned off', async () => {
    const element = await mountPlayer(false)
    expect(session.metadata).toBeNull()
    expect(session.handlers.size).toBe(0)

    element.mediaSession = true
    await expect.poll(() => session.metadata?.title).toBe('Night Drive')

    element.mediaSession = false
    await expect.poll(() => session.metadata).toBeNull()
    expect(session.handlers.get('play')).toBeNull()
  })
})
