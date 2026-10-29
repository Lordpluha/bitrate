import { afterEach, describe, expect, it, vi } from 'vitest'
import type {
  BitratePlayerLegacyAdapter,
  BitratePlayerSource,
  BitratePlayerStreaming,
  TrackManifest,
} from '../../contract'
import { SlotPlayer } from './slotPlayer'

/**
 * `SlotPlayer` against two scripted media elements — jsdom cannot play audio, so each element's
 * clock, buffer and play/pause are driven by the test. MSE is absent here, so a track with a
 * manifest plays its CMAF file natively, or takes the host's legacy path without a
 * `renditionUrl`; the CMAF loader itself is covered in `../cmaf`.
 */
type ScriptedMedia = HTMLAudioElement & {
  setTiming: (timing: {
    currentTime?: number
    duration?: number
    buffered?: [number, number][]
  }) => void
}

const scriptedMedia = (): ScriptedMedia => {
  const media = document.createElement('audio') as ScriptedMedia
  let paused = true
  let currentTime = 0
  let duration = Number.NaN
  let buffered: [number, number][] = []

  Object.defineProperties(media, {
    paused: { get: () => paused },
    readyState: { get: () => 4 },
    duration: { get: () => duration },
    currentTime: {
      get: () => currentTime,
      set: (value: number) => {
        currentTime = value
      },
    },
    buffered: {
      get: () => ({
        end: (index: number) => buffered[index]?.[1] ?? 0,
        length: buffered.length,
        start: (index: number) => buffered[index]?.[0] ?? 0,
      }),
    },
  })
  media.play = vi.fn(async () => {
    /** Like a real element: nothing to play before a source is attached. */
    if (!media.getAttribute('src')) throw new DOMException('no source', 'AbortError')
    if (!paused) return
    paused = false
    media.dispatchEvent(new Event('play'))
  })
  media.pause = vi.fn(() => {
    if (paused) return
    paused = true
    media.dispatchEvent(new Event('pause'))
  })
  media.load = vi.fn()
  media.setTiming = (timing) => {
    currentTime = timing.currentTime ?? currentTime
    duration = timing.duration ?? duration
    buffered = timing.buffered ?? buffered
  }
  return media
}

const source = (key: string, trackId = key): BitratePlayerSource => ({
  key,
  trackId,
  progressiveUrl: `https://cdn.test/${trackId}.mp3`,
})

const manifest: TrackManifest = {
  durationMs: 1_000,
  durationTicks: 48_000,
  renditions: [],
  timescale: 48_000,
  version: 1,
}

/** A manifest with the production ladder; the byte layout is irrelevant off the MSE path. */
const cmafManifest: TrackManifest = {
  ...manifest,
  renditions: [128, 192, 320].map((bitrate) => ({
    bitrate,
    codec: 'mp4a.40.2',
    fragments: [],
    initRange: [0, 708] as const,
    size: 1_000,
  })),
}

const renditionUrl = ({ trackId, bitrate }: { trackId: string; bitrate: number }) =>
  `https://api.test/tracks/${trackId}/cmaf/${bitrate}`

type Setup = {
  streaming?: Partial<BitratePlayerStreaming>
}

const setup = ({ streaming = {} }: Setup = {}) => {
  const media = [scriptedMedia(), scriptedMedia()] as const
  const positions = { remove: vi.fn(), restore: vi.fn(() => null), save: vi.fn() }
  const handlers = {
    onEnded: vi.fn(),
    onFatalError: vi.fn(),
    onPlayingChange: vi.fn(),
    onStateChange: vi.fn(),
  }
  const player = new SlotPlayer({
    media,
    streaming: {
      fetchRange: vi.fn(),
      positions,
      resolveManifest: vi.fn(async () => null),
      ...streaming,
    },
    ...handlers,
  })
  return { handlers, media, player, positions }
}

/** Lets `resolveManifest` settle and the attach that follows it run. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('SlotPlayer', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('plays a track without a manifest from its progressive file', async () => {
    const { media, player } = setup()

    player.setSource(source('k1', 't1'))
    await settle()

    expect(media[0].getAttribute('src')).toBe('https://cdn.test/t1.mp3')
    expect(player.state.key).toBe('k1')
  })

  it('hands a track the browser cannot stream through MSE to the host legacy adapter', async () => {
    const legacy = vi.fn<BitratePlayerLegacyAdapter>(() => ({ destroy: vi.fn() }))
    const { media, player } = setup({
      streaming: { legacy, resolveManifest: vi.fn(async () => manifest) },
    })

    player.setSource(source('k1', 't1'))
    await settle()

    expect(legacy).toHaveBeenCalledWith(
      expect.objectContaining({ isPrefetch: false, key: 'k1', media: media[0], trackId: 't1' }),
    )
  })

  it('plays the CMAF file natively when the browser has no MSE', async () => {
    const legacy = vi.fn<BitratePlayerLegacyAdapter>(() => ({ destroy: vi.fn() }))
    const { media, player } = setup({
      streaming: { legacy, renditionUrl, resolveManifest: vi.fn(async () => cmafManifest) },
    })

    player.setSource(source('k1', 't1'))
    await settle()

    /** Nothing is known about the connection yet, so the lowest rung, as the ABR would start. */
    expect(media[0].getAttribute('src')).toBe('https://api.test/tracks/t1/cmaf/128')
    expect(legacy).not.toHaveBeenCalled()
  })

  it('stops with a fatal error when a track has neither a manifest nor a progressive file', async () => {
    const { handlers, media, player } = setup()

    player.setSource({ key: 'k1', trackId: 't1' })
    await settle()

    expect(media[0].getAttribute('src')).toBeNull()
    expect(handlers.onFatalError).toHaveBeenCalledOnce()
  })

  it("plays the natively streamed file at the listener's pinned quality", async () => {
    const { media, player } = setup({
      streaming: { renditionUrl, resolveManifest: vi.fn(async () => cmafManifest) },
    })

    player.setBitrate(256)
    player.setSource(source('k1', 't1'))
    await settle()

    /** The closest rung at or below the pin, as on the MSE path. */
    expect(media[0].getAttribute('src')).toBe('https://api.test/tracks/t1/cmaf/192')
  })

  it('follows the play intent and reports the element being heard', async () => {
    const { handlers, media, player } = setup()
    player.setSource(source('k1'))
    await settle()

    player.play()
    expect(media[0].play).toHaveBeenCalled()
    expect(handlers.onPlayingChange).toHaveBeenLastCalledWith(true)
    expect(player.state.status).toBe('playing')

    player.pause()
    expect(handlers.onPlayingChange).toHaveBeenLastCalledWith(false)
    expect(player.state.status).toBe('paused')
  })

  it('starts a play asked for before the source attached once the element can play', async () => {
    const { media, player } = setup()

    player.setSource(source('k1'))
    player.play()
    expect(media[0].paused).toBe(true)
    await settle()

    media[0].dispatchEvent(new Event('canplay'))

    expect(media[0].paused).toBe(false)
    expect(player.state.status).toBe('playing')
  })

  it('holds the first play on a constrained connection until enough is buffered', async () => {
    const { media, player } = setup({ streaming: { isConstrained: () => true } })
    player.setSource(source('k1'))
    await settle()
    media[0].setTiming({ buffered: [[0, 1]], currentTime: 0, duration: 200 })

    player.play()
    expect(media[0].play).not.toHaveBeenCalled()

    media[0].setTiming({ buffered: [[0, 5]] })
    media[0].dispatchEvent(new Event('progress'))
    expect(media[0].play).toHaveBeenCalled()
  })

  it('prefetches the next track into the standby element only near the end', async () => {
    const { media, player } = setup()
    player.setSource(source('k1', 't1'))
    player.setNext(source('k2', 't2'))
    await settle()
    media[0].setTiming({ buffered: [[0, 20]], currentTime: 10, duration: 200 })
    media[0].dispatchEvent(new Event('progress'))
    await settle()
    expect(media[1].getAttribute('src')).toBeNull()

    media[0].setTiming({ buffered: [[160, 170]], currentTime: 160 })
    media[0].dispatchEvent(new Event('progress'))
    await settle()
    expect(media[1].getAttribute('src')).toBe('https://cdn.test/t2.mp3')
  })

  it('switches to the prefetched element at once when the host moves source to it', async () => {
    const { media, player } = setup()
    player.setSource(source('k1', 't1'))
    player.setNext(source('k2', 't2'))
    await settle()
    player.play()
    media[0].setTiming({ buffered: [[160, 170]], currentTime: 160, duration: 200 })
    media[0].dispatchEvent(new Event('progress'))
    await settle()

    player.setSource(source('k2', 't2'))

    expect(media[1].play).toHaveBeenCalled()
    expect(media[1].currentTime).toBe(0)
    expect(media[0].paused).toBe(true)
    expect(player.state.key).toBe('k2')
  })

  describe('gapless hand-over', () => {
    /** A playing track 30 s from its end with the next play already prefetched. */
    const nearTheEnd = async () => {
      const ctx = setup()
      ctx.player.setSource(source('k1', 't1'))
      ctx.player.setNext(source('k2', 't2'))
      await settle()
      ctx.player.play()
      ctx.media[0].setTiming({ buffered: [[160, 200]], currentTime: 170, duration: 200 })
      ctx.media[0].dispatchEvent(new Event('progress'))
      await settle()
      expect(ctx.media[1].getAttribute('src')).toBe('https://cdn.test/t2.mp3')
      vi.useFakeTimers()
      return ctx
    }

    afterEach(() => {
      vi.useRealTimers()
    })

    it('starts the next play just before the current one ends and does not restart it', async () => {
      const { handlers, media, player } = await nearTheEnd()

      media[0].setTiming({ currentTime: 199.5 })
      media[0].dispatchEvent(new Event('timeupdate'))
      expect(media[1].play).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(500)
      expect(media[1].play).toHaveBeenCalledTimes(1)
      expect(media[0].paused).toBe(false)

      media[1].setTiming({ currentTime: 0.2 })
      media[0].dispatchEvent(new Event('ended'))
      expect(handlers.onEnded).toHaveBeenCalledWith({ key: 'k1' })
      player.setSource(source('k2', 't2'))

      /** Still running from where it started: the switch did not seek it back to 0. */
      expect(player.state.key).toBe('k2')
      expect(media[1].currentTime).toBe(0.2)
      expect(media[1].paused).toBe(false)
      expect(media[0].paused).toBe(true)
    })

    it('drops the hand-over when the listener seeks away from the end', async () => {
      const { media, player } = await nearTheEnd()
      media[0].setTiming({ currentTime: 199.5 })
      media[0].dispatchEvent(new Event('timeupdate'))

      player.seek(30)
      await vi.advanceTimersByTimeAsync(1_000)

      expect(media[1].play).not.toHaveBeenCalled()
    })

    it('prepares nothing while paused', async () => {
      const { media, player } = await nearTheEnd()
      player.pause()

      media[0].setTiming({ currentTime: 199.5 })
      media[0].dispatchEvent(new Event('timeupdate'))
      await vi.advanceTimersByTimeAsync(1_000)

      expect(media[1].play).not.toHaveBeenCalled()
    })
  })

  it('reports the end of the play and forgets its position', async () => {
    const { handlers, media, player, positions } = setup()
    player.setSource(source('k1'))
    await settle()

    media[0].dispatchEvent(new Event('ended'))

    expect(handlers.onEnded).toHaveBeenCalledWith({ key: 'k1' })
    expect(positions.remove).toHaveBeenCalledWith('k1')
  })

  it('drops the previous play position when the source changes', async () => {
    const { player, positions } = setup()
    player.setSource(source('k1'))
    player.setSource(source('k2'))

    expect(positions.remove).toHaveBeenCalledWith('k1')
  })

  it("shows the source's duration and start until the media knows its own", async () => {
    const { media, player } = setup()

    player.setSource({ ...source('k1'), duration: 182, startTime: 64 })

    expect(player.state).toMatchObject({ currentTime: 64, duration: 182 })
    media[0].setTiming({ currentTime: 0, duration: 181.5 })
    expect(player.state).toMatchObject({ currentTime: 0, duration: 181.5 })
  })

  it("resumes from the source's start when the position store has nothing for the key", async () => {
    const { media, player } = setup()
    player.setSource({ ...source('k1'), startTime: 64 })
    await settle()

    media[0].setTiming({ duration: 200 })
    media[0].dispatchEvent(new Event('loadedmetadata'))

    expect(media[0].currentTime).toBe(64)
  })

  it('resumes from the saved position once metadata loads', async () => {
    const { media, player, positions } = setup()
    positions.restore.mockReturnValue(42 as never)
    player.setSource(source('k1'))
    await settle()

    media[0].setTiming({ duration: 200 })
    media[0].dispatchEvent(new Event('loadedmetadata'))

    expect(positions.restore).toHaveBeenCalledWith('k1')
    expect(media[0].currentTime).toBe(42)
  })

  it('stops and reports a fatal error when the track being heard cannot play at all', async () => {
    const { handlers, media, player } = setup()
    player.setSource(source('k1'))
    await settle()
    player.play()

    media[0].dispatchEvent(new Event('error'))

    expect(handlers.onFatalError).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'playback' }),
    )
    expect(player.state.status).toBe('error')
  })

  it('applies volume and mute to both elements', () => {
    const { media, player } = setup()

    player.setVolume(0.4)
    player.setMuted(true)

    expect(media.map((element) => element.volume)).toEqual([0.4, 0.4])
    expect(media.map((element) => element.muted)).toEqual([true, true])
    expect(player.state.volume).toBe(0.4)
  })

  it('saves the position before the page is hidden', async () => {
    const { media, player, positions } = setup()
    player.setSource(source('k1'))
    await settle()
    media[0].setTiming({ currentTime: 33 })

    window.dispatchEvent(new Event('pagehide'))

    expect(positions.save).toHaveBeenCalledWith('k1', 33)
    player.destroy()
  })
})
