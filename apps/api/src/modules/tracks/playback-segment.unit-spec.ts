import { describe, expect, it } from '@jest/globals'
import { audioMsBetween, planRenditionResponse, renditionSegments } from './playback-segment'
import type { ManifestRendition } from './track-playback.types'
import { UnsatisfiableRangeError } from './track-playback.types'

/**
 * A 4000-byte rendition at timescale 48000: init 0-708, a sidx gap 709-799, two 10-second
 * fragments 800-1899 and 1900-2999, and a trailing mfra gap 3000-3999.
 */
const rendition: ManifestRendition = {
  bitrate: 128,
  codec: 'mp4a.40.2',
  size: 4000,
  initRange: [0, 708],
  fragments: [
    [0, 480_000, 800, 1100],
    [480_000, 480_000, 1900, 1100],
  ],
}
const segments = renditionSegments(rendition, 48_000)

const range = (start: number, end: number, isPartial = true) => ({
  start,
  end,
  contentLength: end - start + 1,
  isPartial,
})

describe('renditionSegments', () => {
  it('covers the whole file: init, gaps and fragments, with audio time only on fragments', () => {
    expect(segments).toEqual([
      { start: 0, end: 708, audioMs: 0 },
      { start: 709, end: 799, audioMs: 0 },
      { start: 800, end: 1899, audioMs: 10_000 },
      { start: 1900, end: 2999, audioMs: 10_000 },
      { start: 3000, end: 3999, audioMs: 0 },
    ])
  })
})

describe('audioMsBetween', () => {
  it('counts whole fragments, partial fragments and nothing for init or gaps', () => {
    expect(audioMsBetween(segments, 0, 799)).toBe(0)
    expect(audioMsBetween(segments, 800, 1899)).toBe(10_000)
    expect(audioMsBetween(segments, 1350, 2449)).toBe(10_000)
    expect(audioMsBetween(segments, 0, 3999)).toBe(20_000)
  })
})

describe('planRenditionResponse', () => {
  it('serves a closed range of at most one fragment exactly, as the MSE loader asks', () => {
    expect(planRenditionResponse(range(800, 1899), segments)).toEqual({
      kind: 'exact',
      ...range(800, 1899),
      audioMs: 10_000,
    })
  })

  it('serves a small closed range across a segment boundary exactly, as WebKit probes it', () => {
    expect(planRenditionResponse(range(500, 1349), segments)).toEqual({
      kind: 'exact',
      ...range(500, 1349),
      audioMs: 5000,
    })
  })

  it('paces a request without Range through to the end of the file', () => {
    expect(planRenditionResponse(range(0, 3999, false), segments)).toEqual({
      kind: 'paced',
      ...range(0, 3999),
    })
  })

  it('paces an open or oversized range instead of serving it at once', () => {
    expect(planRenditionResponse(range(800, 3999), segments)).toEqual({
      kind: 'paced',
      ...range(800, 3999),
    })
  })

  it('refuses a range that starts past the last byte', () => {
    expect(() => planRenditionResponse(range(4000, 4100), segments)).toThrow(
      UnsatisfiableRangeError,
    )
  })
})
