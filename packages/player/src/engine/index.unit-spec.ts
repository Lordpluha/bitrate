import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPlaybackEngine, type PlaybackEngine, type PlaybackEngineState } from './index'

const MEDIA_ERR_SRC_NOT_SUPPORTED = 4
const MEDIA_ERR_NETWORK = 2

function mediaError(media: HTMLMediaElement, code: number): void {
  Object.defineProperty(media, 'error', { value: { code }, configurable: true })
  media.dispatchEvent(new Event('error'))
}

describe('createPlaybackEngine', () => {
  let media: HTMLAudioElement
  let play: ReturnType<typeof vi.spyOn>
  let pause: ReturnType<typeof vi.spyOn>
  let load: ReturnType<typeof vi.spyOn>
  let engine: PlaybackEngine | null = null

  beforeEach(() => {
    media = document.createElement('audio')
    play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined)
    load = vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined)
  })

  afterEach(() => {
    engine?.destroy()
    engine = null
    vi.restoreAllMocks()
  })

  it('starts idle and resolves the source only on the first play', async () => {
    const resolveSource = vi.fn().mockResolvedValue('https://cdn.test/320.m4a')
    engine = createPlaybackEngine({ media, resolveSource })

    expect(engine.getState().status).toBe('idle')

    await engine.play(320)

    expect(resolveSource).toHaveBeenCalledExactlyOnceWith({ bitrate: 320 })
    expect(media.src).toBe('https://cdn.test/320.m4a')
    expect(play).toHaveBeenCalledTimes(1)
  })

  it('does not re-resolve when the same bitrate plays again', async () => {
    const resolveSource = vi.fn().mockResolvedValue('https://cdn.test/320.m4a')
    engine = createPlaybackEngine({ media, resolveSource })

    await engine.play(320)
    await engine.play(320)

    expect(resolveSource).toHaveBeenCalledTimes(1)
    expect(play).toHaveBeenCalledTimes(2)
  })

  it('re-resolves when the requested bitrate changes', async () => {
    const resolveSource = vi
      .fn()
      .mockResolvedValueOnce('https://cdn.test/320.m4a')
      .mockResolvedValueOnce('https://cdn.test/192.m4a')
    engine = createPlaybackEngine({ media, resolveSource })

    await engine.play(320)
    await engine.play(192)

    expect(resolveSource).toHaveBeenCalledTimes(2)
    expect(media.src).toBe('https://cdn.test/192.m4a')
  })

  it('notifies subscribers with playing/paused status as native events fire', async () => {
    const resolveSource = vi.fn().mockResolvedValue('https://cdn.test/320.m4a')
    engine = createPlaybackEngine({ media, resolveSource })
    const states: PlaybackEngineState[] = []
    engine.subscribe((state) => states.push(state))

    await engine.play(320)
    media.dispatchEvent(new Event('play'))
    engine.pause()
    media.dispatchEvent(new Event('pause'))

    expect(states.map((s) => s.status)).toEqual(
      expect.arrayContaining(['preparing', 'playing', 'paused']),
    )
    expect(pause).toHaveBeenCalledTimes(1)
  })

  it('calls onEnded and reports paused when the media element ends', async () => {
    const resolveSource = vi.fn().mockResolvedValue('https://cdn.test/320.m4a')
    const onEnded = vi.fn()
    engine = createPlaybackEngine({ media, resolveSource, onEnded })

    await engine.play(320)
    media.dispatchEvent(new Event('ended'))

    expect(onEnded).toHaveBeenCalledTimes(1)
    expect(engine.getState().status).toBe('paused')
  })

  describe('failures', () => {
    it('reports a source error when the resolver rejects, and never calls play()', async () => {
      const resolveSource = vi.fn().mockRejectedValue(new Error('probe failed'))
      engine = createPlaybackEngine({ media, resolveSource })

      await expect(engine.play(320)).rejects.toThrow('probe failed')

      expect(engine.getState()).toMatchObject({
        status: 'error',
        error: { code: 'source', message: 'probe failed' },
      })
      expect(play).not.toHaveBeenCalled()
    })

    it('reports a playback error when play() rejects', async () => {
      const resolveSource = vi.fn().mockResolvedValue('https://cdn.test/320.m4a')
      play.mockRejectedValueOnce(new DOMException('blocked', 'NotAllowedError'))
      engine = createPlaybackEngine({ media, resolveSource })

      await expect(engine.play(320)).rejects.toThrow('blocked')

      expect(engine.getState().error).toMatchObject({ code: 'playback' })
    })

    it('keeps the source loaded on an unsupported-rendition error', async () => {
      const resolveSource = vi.fn().mockResolvedValue('https://cdn.test/320.m4a')
      engine = createPlaybackEngine({ media, resolveSource })
      await engine.play(320)

      mediaError(media, MEDIA_ERR_SRC_NOT_SUPPORTED)

      expect(engine.getState().error).toMatchObject({ code: 'unsupported' })

      /** Re-playing the same bitrate must not re-resolve — the source is still considered loaded. */
      await engine.play(320)
      expect(resolveSource).toHaveBeenCalledTimes(1)
    })

    it('drops the source on a network error so the next play() re-resolves', async () => {
      const resolveSource = vi.fn().mockResolvedValue('https://cdn.test/320.m4a')
      engine = createPlaybackEngine({ media, resolveSource })
      await engine.play(320)

      mediaError(media, MEDIA_ERR_NETWORK)
      expect(engine.getState().error).toMatchObject({ code: 'network' })

      await engine.play(320)
      expect(resolveSource).toHaveBeenCalledTimes(2)
    })
  })

  describe('teardown', () => {
    it('pauses, clears the source, and stops notifying subscribers on destroy', async () => {
      const resolveSource = vi.fn().mockResolvedValue('https://cdn.test/320.m4a')
      engine = createPlaybackEngine({ media, resolveSource })
      await engine.play(320)

      const listener = vi.fn()
      engine.subscribe(listener)
      engine.destroy()

      expect(pause).toHaveBeenCalledTimes(1)
      expect(load).toHaveBeenCalledTimes(1)
      expect(media.hasAttribute('src')).toBe(false)

      media.dispatchEvent(new Event('play'))
      expect(listener).not.toHaveBeenCalled()
    })
  })
})
