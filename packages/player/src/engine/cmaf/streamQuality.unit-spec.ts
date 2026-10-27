import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { configureCmafEngine } from './environment'
import type { TrackManifest } from './manifest'
import { BitrateSelector } from './bitrateSelector'
import { capBitrate, setMaxStreamBitrate } from './streamQuality'

const ladder: TrackManifest = {
  durationMs: 1_000,
  durationTicks: 48_000,
  renditions: [128, 192, 320].map((bitrate) => ({
    bitrate,
    codec: 'mp4a.40.2',
    fragments: [[0, 48_000, 2, 2]],
    initRange: [0, 1],
    size: 4,
  })),
  timescale: 48_000,
  version: 1,
}

describe('capBitrate', () => {
  it('keeps a rendition within the cap', () => {
    expect(capBitrate({ bitrate: 192, manifest: ladder, maxBitrate: 192 })).toBe(192)
  })

  it('drops to the best rendition under the cap', () => {
    expect(capBitrate({ bitrate: 320, manifest: ladder, maxBitrate: 192 })).toBe(192)
    expect(capBitrate({ bitrate: 320, manifest: ladder, maxBitrate: 150 })).toBe(128)
  })

  it('uses the lowest rendition when every one is above the cap', () => {
    expect(capBitrate({ bitrate: 320, manifest: ladder, maxBitrate: 64 })).toBe(128)
  })

  it('leaves the bitrate alone without a cap', () => {
    expect(capBitrate({ bitrate: 320, manifest: ladder, maxBitrate: null })).toBe(320)
  })
})

describe('BitrateSelector with a quality cap', () => {
  beforeEach(() => {
    localStorage.clear()
    configureCmafEngine({ storage: localStorage })
  })
  afterEach(() => {
    setMaxStreamBitrate(null)
  })

  it("starts and stays within the listener's quality setting", () => {
    setMaxStreamBitrate(128)
    const selector = new BitrateSelector({
      initialBitrate: 320,
      manifest: ladder,
    })

    expect(selector.bitrate).toBe(128)
    expect(selector.next(60)).toBe(128)
  })

  it('still honours a rendition the listener pins by hand', () => {
    setMaxStreamBitrate(128)
    const selector = new BitrateSelector({ manifest: ladder })

    selector.pin(320)

    expect(selector.next(60)).toBe(320)
  })
})
