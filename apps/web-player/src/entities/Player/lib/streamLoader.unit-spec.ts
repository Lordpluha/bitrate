import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  ManifestRendition,
  TrackManifest,
} from '@/entities/Player/model/manifest.types'
import { type FetchRangeInput, StreamLoader } from './streamLoader'

class FakeSourceBuffer extends EventTarget {
  static holdFirstAppend = false

  appended: number[] = []
  buffered = {
    length: 0,
    start: () => 0,
    end: () => 0,
  } as TimeRanges
  mode: AppendMode = 'segments'
  updating = false

  constructor(private readonly mediaSource: FakeMediaSource) {
    super()
  }

  appendBuffer(bytes: ArrayBuffer) {
    if (this.mediaSource.readyState === 'ended') {
      this.mediaSource.readyState = 'open'
    }
    this.appended.push(bytes.byteLength)
    this.updating = true
    if (FakeSourceBuffer.holdFirstAppend && this.appended.length === 1) {
      FakeSourceBuffer.holdFirstAppend = false
      return
    }
    queueMicrotask(() => {
      this.updating = false
      this.dispatchEvent(new Event('updateend'))
    })
  }

  remove() {
    this.updating = true
    queueMicrotask(() => {
      this.updating = false
      this.dispatchEvent(new Event('updateend'))
    })
  }

  abort() {
    this.updating = false
    this.dispatchEvent(new Event('abort'))
  }
}

class FakeMediaSource extends EventTarget {
  static autoOpen = true
  static instances: FakeMediaSource[] = []
  static throwOnAddSourceBuffer = false

  static isTypeSupported() {
    return true
  }

  duration = Number.NaN
  readyState: 'closed' | 'ended' | 'open' = 'closed'
  readonly sourceBuffer = new FakeSourceBuffer(this)

  constructor() {
    super()
    FakeMediaSource.instances.push(this)
    if (FakeMediaSource.autoOpen) {
      queueMicrotask(() => {
        this.readyState = 'open'
        this.dispatchEvent(new Event('sourceopen'))
      })
    }
  }

  addSourceBuffer() {
    if (FakeMediaSource.throwOnAddSourceBuffer) {
      throw new DOMException('unsupported', 'NotSupportedError')
    }
    return this.sourceBuffer as unknown as SourceBuffer
  }

  endOfStream() {
    this.readyState = 'ended'
  }
}

/**
 * Named rather than read back out of `manifest.renditions[0]`: this app compiles
 * with `noUncheckedIndexedAccess`, so indexing yields `T | undefined` and
 * spreading it would widen every field to optional.
 */
const baseRendition: ManifestRendition = {
  bitrate: 128,
  codec: 'mp4a.40.2',
  fragments: [[0, 48_000, 2, 2]],
  initRange: [0, 1],
  size: 4,
}

const manifest: TrackManifest = {
  durationMs: 1_000,
  durationTicks: 48_000,
  renditions: [baseRendition],
  timescale: 48_000,
  version: 1,
}

const qualityManifest: TrackManifest = {
  ...manifest,
  renditions: [128, 320].map((bitrate) => ({ ...baseRendition, bitrate })),
}

const bufferedRanges = (windows: [number, number][]): TimeRanges =>
  ({
    end: (index: number) => windows[index]?.[1] ?? 0,
    length: windows.length,
    start: (index: number) => windows[index]?.[0] ?? 0,
  }) as TimeRanges

describe('StreamLoader', () => {
  beforeEach(() => {
    FakeMediaSource.autoOpen = true
    FakeMediaSource.instances = []
    FakeMediaSource.throwOnAddSourceBuffer = false
    FakeSourceBuffer.holdFirstAppend = false
    localStorage.clear()
    vi.stubGlobal('MediaSource', FakeMediaSource)
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:stream-loader-test'),
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('retries transient fragment failures within a finite budget', async () => {
    let fragmentAttempts = 0
    const fetchRange = vi.fn(
      async ({ range }: { range: readonly number[] }) => {
        if (range[0] === 2 && fragmentAttempts++ < 2) {
          throw new Error('temporary network failure')
        }
        return new ArrayBuffer(2)
      },
    )
    const onError = vi.fn()
    const loader = new StreamLoader({
      audio: document.createElement('audio'),
      fetchRange,
      manifest,
      maxRequestAttempts: 3,
      onError,
      retryBaseDelayMs: 0,
    })

    await loader.start()

    expect(fragmentAttempts).toBe(3)
    expect(onError).not.toHaveBeenCalled()
    loader.destroy()
  })

  it('keeps a manual bitrate pinned across an ABR decision', async () => {
    localStorage.setItem(
      'player-throughput',
      JSON.stringify({ bps: 150_000, savedAtMs: Date.now() }),
    )
    const fetchRange = vi.fn().mockResolvedValue(new ArrayBuffer(2))
    const loader = new StreamLoader({
      audio: document.createElement('audio'),
      fetchRange,
      initialBitrate: 320,
      manifest: qualityManifest,
    })

    loader.setBitrate(320)
    await loader.start()

    expect(loader.isAutoBitrate).toBe(false)
    expect(
      fetchRange.mock.calls.every(([input]) => input.bitrate === 320),
    ).toBe(true)
    loader.destroy()
  })

  it('restores ABR after leaving a manual bitrate pin', async () => {
    localStorage.setItem(
      'player-throughput',
      JSON.stringify({ bps: 150_000, savedAtMs: Date.now() }),
    )
    const fetchRange = vi.fn().mockResolvedValue(new ArrayBuffer(2))
    const loader = new StreamLoader({
      audio: document.createElement('audio'),
      fetchRange,
      initialBitrate: 320,
      manifest: qualityManifest,
    })

    loader.setBitrate(320)
    loader.setAutoBitrate()
    await loader.start()

    expect(loader.isAutoBitrate).toBe(true)
    expect(
      fetchRange.mock.calls.every(([input]) => input.bitrate === 128),
    ).toBe(true)
    loader.destroy()
  })

  it('rejects a manual bitrate outside the manifest ladder', () => {
    const loader = new StreamLoader({
      audio: document.createElement('audio'),
      fetchRange: vi.fn(),
      manifest: qualityManifest,
    })

    expect(() => loader.setBitrate(999)).toThrow(RangeError)
    loader.destroy()
  })

  it('reports a persistent request failure once after exhausting retries', async () => {
    const onError = vi.fn()
    const loader = new StreamLoader({
      audio: document.createElement('audio'),
      fetchRange: vi.fn().mockRejectedValue(new Error('offline')),
      manifest,
      maxRequestAttempts: 2,
      onError,
      retryBaseDelayMs: 0,
    })

    await loader.start()

    expect(onError).toHaveBeenCalledOnce()
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'offline' }),
    )
    loader.destroy()
  })

  it('times out a range request even when the transport ignores abort', async () => {
    const onError = vi.fn()
    const loader = new StreamLoader({
      audio: document.createElement('audio'),
      fetchRange: vi.fn(() => new Promise<ArrayBuffer>(() => undefined)),
      manifest,
      maxRequestAttempts: 1,
      onError,
      requestTimeoutMs: 1,
    })

    await loader.start()

    expect(onError).toHaveBeenCalledOnce()
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Audio fragment request timed out' }),
    )
    loader.destroy()
  })

  it('cancels an in-flight fragment before restarting from a seek', async () => {
    const audio = document.createElement('audio')
    const onError = vi.fn()
    let fragmentAttempt = 0
    const fetchRange = vi.fn(({ range, signal }: FetchRangeInput) => {
      if (range[0] === 0) return Promise.resolve(new ArrayBuffer(2))

      fragmentAttempt += 1
      if (fragmentAttempt > 1) return Promise.resolve(new ArrayBuffer(2))

      return new Promise<ArrayBuffer>((_resolve, reject) => {
        signal.addEventListener(
          'abort',
          () => reject(new DOMException('aborted', 'AbortError')),
          { once: true },
        )
      })
    })
    const loader = new StreamLoader({ audio, fetchRange, manifest, onError })

    const started = loader.start()
    await vi.waitFor(() => expect(fetchRange).toHaveBeenCalledTimes(2))
    audio.currentTime = 0
    audio.dispatchEvent(new Event('seeking'))

    await started
    await vi.waitFor(() => expect(fetchRange).toHaveBeenCalledTimes(3))
    expect(onError).not.toHaveBeenCalled()
    loader.destroy()
  })

  it('re-appends an init segment cancelled by a seek', async () => {
    FakeSourceBuffer.holdFirstAppend = true
    const audio = document.createElement('audio')
    const fetchRange = vi.fn().mockResolvedValue(new ArrayBuffer(2))
    const onError = vi.fn()
    const loader = new StreamLoader({ audio, fetchRange, manifest, onError })

    const started = loader.start()
    await vi.waitFor(() => {
      expect(FakeMediaSource.instances[0]?.sourceBuffer.updating).toBe(true)
    })

    audio.currentTime = 0
    audio.dispatchEvent(new Event('seeking'))
    await started
    await vi.waitFor(() => expect(fetchRange).toHaveBeenCalledTimes(3))

    expect(fetchRange.mock.calls.map(([input]) => input.range)).toEqual([
      [0, 1],
      [0, 1],
      [2, 3],
    ])
    expect(onError).not.toHaveBeenCalled()
    loader.destroy()
  })

  it('reopens an ended stream when seeking into a trimmed range', async () => {
    const audio = document.createElement('audio')
    const fetchRange = vi.fn().mockResolvedValue(new ArrayBuffer(2))
    const loader = new StreamLoader({ audio, fetchRange, manifest })

    await loader.start()
    const mediaSource = FakeMediaSource.instances[0]
    if (!mediaSource) throw new Error('MediaSource was not created')
    expect(mediaSource.readyState).toBe('ended')
    expect(fetchRange).toHaveBeenCalledTimes(2)

    audio.currentTime = 0
    audio.dispatchEvent(new Event('seeking'))

    await vi.waitFor(() => expect(fetchRange).toHaveBeenCalledTimes(3))
    expect(mediaSource.sourceBuffer.appended).toHaveLength(3)
    loader.destroy()
  })

  it('does not re-fetch a fragment retained across a backward seek', async () => {
    const audio = document.createElement('audio')
    const fetchRange = vi.fn().mockResolvedValue(new ArrayBuffer(2))
    const loader = new StreamLoader({ audio, fetchRange, manifest })

    await loader.start()
    Object.defineProperty(audio, 'buffered', {
      configurable: true,
      value: bufferedRanges([[0, 1]]),
    })

    audio.currentTime = 0
    audio.dispatchEvent(new Event('seeking'))
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(fetchRange).toHaveBeenCalledTimes(2)
    loader.destroy()
  })

  it('cancels a pending source-open wait during teardown', async () => {
    FakeMediaSource.autoOpen = false
    const loader = new StreamLoader({
      audio: document.createElement('audio'),
      fetchRange: vi.fn(),
      manifest,
      sourceOpenTimeoutMs: 60_000,
    })

    const start = loader.start()
    loader.destroy()

    await expect(start).resolves.toBeUndefined()
  })

  it('does not start after it has already been destroyed', async () => {
    const audio = document.createElement('audio')
    const fetchRange = vi.fn()
    const loader = new StreamLoader({ audio, fetchRange, manifest })

    loader.destroy()
    await loader.start()

    expect(FakeMediaSource.instances).toHaveLength(0)
    expect(fetchRange).not.toHaveBeenCalled()
  })

  it('times out when MediaSource never opens', async () => {
    FakeMediaSource.autoOpen = false
    const loader = new StreamLoader({
      audio: document.createElement('audio'),
      fetchRange: vi.fn(),
      manifest,
      sourceOpenTimeoutMs: 1,
    })

    await expect(loader.start()).rejects.toThrow(/Timed out/)
    loader.destroy()
  })

  it('rejects startup failures so the caller can fall back', async () => {
    FakeMediaSource.throwOnAddSourceBuffer = true
    const loader = new StreamLoader({
      audio: document.createElement('audio'),
      fetchRange: vi.fn(),
      manifest,
      sourceOpenTimeoutMs: 5,
    })

    await expect(loader.start()).rejects.toThrow(/unsupported/)
    loader.destroy()
  })
})
