import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { TrackManifest } from '@/entities/Player/model/manifest.types'
import { BitrateSelector } from './bitrateSelector'
import { setMaxStreamBitrate } from './streamQuality'
import { rememberThroughput } from './throughputMemory'

/**
 * Characterises how a track picks and changes its rendition, so moving the
 * selector into `@bitrate/player` cannot change it unnoticed.
 */
const ladder: TrackManifest = {
  durationMs: 10_000,
  durationTicks: 480_000,
  renditions: [64, 128, 320].map((bitrate) => ({
    bitrate,
    codec: 'mp4a.40.2',
    fragments: [[0, 480_000, 2, 2]],
    initRange: [0, 1],
    size: 4,
  })),
  timescale: 48_000,
  version: 1,
}

describe('BitrateSelector', () => {
  beforeEach(() => {
    localStorage.clear()
    setMaxStreamBitrate(null)
  })

  afterEach(() => {
    setMaxStreamBitrate(null)
    vi.useRealTimers()
  })

  it('opens on the lowest rung when nothing is known about the connection', () => {
    expect(new BitrateSelector({ manifest: ladder }).bitrate).toBe(64)
  })

  it('opens on the rung half the remembered bandwidth affords', () => {
    rememberThroughput({ bps: 700_000 })

    expect(new BitrateSelector({ manifest: ladder }).bitrate).toBe(320)
  })

  it('never opens above the quality cap, falling back to the best allowed rung', () => {
    rememberThroughput({ bps: 10_000_000 })

    expect(
      new BitrateSelector({ manifest: ladder, maxBitrate: 128 }).bitrate,
    ).toBe(128)
  })

  it('reads the listener cap from the module setting by default', () => {
    rememberThroughput({ bps: 10_000_000 })
    setMaxStreamBitrate(64)

    expect(new BitrateSelector({ manifest: ladder }).bitrate).toBe(64)
  })

  it('keeps a pinned rendition until automatic selection is restored', () => {
    const onChange = vi.fn()
    const selector = new BitrateSelector({ manifest: ladder, onChange })

    expect(selector.pin(320)).toBe(true)
    expect(selector.isAutomatic).toBe(false)
    expect(selector.next(0)).toBe(320)
    expect(onChange).toHaveBeenCalledWith(320)

    expect(selector.enableAutomatic()).toBe(true)
    expect(selector.enableAutomatic()).toBe(false)
  })

  it('rejects pinning a rendition the manifest does not have', () => {
    expect(() => new BitrateSelector({ manifest: ladder }).pin(256)).toThrow(
      RangeError,
    )
  })

  it('drops to the floor on the fragment after a stall', () => {
    const selector = new BitrateSelector({
      initialBitrate: 320,
      manifest: ladder,
    })

    selector.noteStall()

    expect(selector.next(30)).toBe(64)
  })

  it('remembers the measured bandwidth for the next track', () => {
    const selector = new BitrateSelector({ manifest: ladder })
    selector.addSample({ bytes: 100_000, durationMs: 1_000 })

    expect(new BitrateSelector({ manifest: ladder }).estimatedBps).toBe(800_000)
  })
})
