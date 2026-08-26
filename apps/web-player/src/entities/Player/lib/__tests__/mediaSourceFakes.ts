import { vi } from 'vitest'
import type {
  ManifestRendition,
  TrackManifest,
} from '@/entities/Player/model/manifest.types'

export class FakeSourceBuffer extends EventTarget {
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

export class FakeMediaSource extends EventTarget {
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
export const baseRendition: ManifestRendition = {
  bitrate: 128,
  codec: 'mp4a.40.2',
  fragments: [[0, 48_000, 2, 2]],
  initRange: [0, 1],
  size: 4,
}

export const manifest: TrackManifest = {
  durationMs: 1_000,
  durationTicks: 48_000,
  renditions: [baseRendition],
  timescale: 48_000,
  version: 1,
}

export const qualityManifest: TrackManifest = {
  ...manifest,
  renditions: [128, 320].map((bitrate) => ({ ...baseRendition, bitrate })),
}

export const bufferedRanges = (windows: [number, number][]): TimeRanges =>
  ({
    end: (index: number) => windows[index]?.[1] ?? 0,
    length: windows.length,
    start: (index: number) => windows[index]?.[0] ?? 0,
  }) as TimeRanges

/** Installs the MSE fakes and object-URL stubs one loader spec depends on. */
export const installMediaSourceFakes = () => {
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
}
