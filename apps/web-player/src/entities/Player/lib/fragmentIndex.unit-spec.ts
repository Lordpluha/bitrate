import { describe, expect, it } from 'vitest'

import type { TrackManifest } from '@/entities/Player/model/manifest.types'
import {
  findFragmentIndexAt,
  getBufferedAhead,
  resolveFragment,
  selectRendition,
  toRangeHeader,
} from './fragmentIndex'

/** Mirrors real output: first fragment 191 AAC frames, the rest 192. */
const buildManifest = (): TrackManifest => {
  const durations = [
    195_584,
    ...Array.from({ length: 13 }, () => 196_608),
    128_512,
  ]
  let startTicks = 0
  let offset = 929

  const fragments = durations.map((durationTicks) => {
    const length = 66_000
    const entry = [startTicks, durationTicks, offset, length] as const
    startTicks += durationTicks
    offset += length
    return entry
  })

  return {
    version: 1,
    timescale: 48_000,
    durationTicks: 2_880_000,
    durationMs: 60_000,
    renditions: [
      {
        bitrate: 128,
        codec: 'mp4a.40.2',
        size: 977_980,
        initRange: [0, 707],
        fragments,
      },
      {
        bitrate: 192,
        codec: 'mp4a.40.2',
        size: 1_456_523,
        initRange: [0, 707],
        fragments,
      },
      {
        bitrate: 320,
        codec: 'mp4a.40.2',
        size: 2_101_902,
        initRange: [0, 707],
        fragments,
      },
    ],
  }
}

const manifest = buildManifest()
const rendition = manifest.renditions[0]!

describe('toRangeHeader', () => {
  it('emits an inclusive byte range', () => {
    expect(toRangeHeader([929, 67_166])).toBe('bytes=929-67166')
  })
})

describe('resolveFragment', () => {
  it('converts ticks to seconds and length to an inclusive range', () => {
    const resolved = resolveFragment({ manifest, rendition, index: 0 })

    expect(resolved).toMatchObject({
      index: 0,
      bitrate: 128,
      startSeconds: 0,
      byteRange: [929, 66_928],
    })
    expect(resolved?.endSeconds).toBeCloseTo(4.0747, 3)
  })

  it('returns null past the last fragment', () => {
    expect(resolveFragment({ manifest, rendition, index: 99 })).toBeNull()
  })

  it('produces a range whose length matches the manifest entry', () => {
    const resolved = resolveFragment({ manifest, rendition, index: 3 })
    const [start, end] = resolved!.byteRange

    expect(end - start + 1).toBe(66_000)
  })
})

describe('findFragmentIndexAt', () => {
  it('finds the first fragment at time zero', () => {
    expect(findFragmentIndexAt({ manifest, rendition, timeSeconds: 0 })).toBe(0)
  })

  it('finds the fragment containing an arbitrary seek target', () => {
    /** 42 s lands inside fragment 10: 4.0747 + 9 x 4.096 = 40.94 s. */
    expect(findFragmentIndexAt({ manifest, rendition, timeSeconds: 42 })).toBe(
      10,
    )
  })

  it('lands on the fragment that starts exactly at the boundary', () => {
    const boundarySeconds = 195_584 / 48_000

    expect(
      findFragmentIndexAt({
        manifest,
        rendition,
        timeSeconds: boundarySeconds,
      }),
    ).toBe(1)
  })

  it('clamps a negative time to the first fragment', () => {
    expect(findFragmentIndexAt({ manifest, rendition, timeSeconds: -10 })).toBe(
      0,
    )
  })

  it('clamps a time past the end to the last fragment', () => {
    expect(
      findFragmentIndexAt({ manifest, rendition, timeSeconds: 9_999 }),
    ).toBe(14)
  })

  it('resolves every fragment to itself at its own start time', () => {
    for (const [index, fragment] of rendition.fragments.entries()) {
      const startSeconds = fragment[0] / manifest.timescale

      expect(
        findFragmentIndexAt({ manifest, rendition, timeSeconds: startSeconds }),
      ).toBe(index)
    }
  })

  it('returns -1 for an empty rendition', () => {
    const empty = { ...rendition, fragments: [] }

    expect(
      findFragmentIndexAt({ manifest, rendition: empty, timeSeconds: 5 }),
    ).toBe(-1)
  })
})

describe('selectRendition', () => {
  it('returns the requested bitrate', () => {
    expect(selectRendition(manifest, 192)?.bitrate).toBe(192)
  })

  it('falls back to the lowest rendition for an unknown bitrate', () => {
    expect(selectRendition(manifest, 999)?.bitrate).toBe(128)
  })
})

describe('getBufferedAhead', () => {
  const ranges = (windows: [number, number][]): TimeRanges =>
    ({
      length: windows.length,
      start: (index: number) => windows[index]![0],
      end: (index: number) => windows[index]![1],
    }) as TimeRanges

  it('measures from the play head to the end of its range', () => {
    expect(getBufferedAhead(ranges([[0, 30]]), 10)).toBe(20)
  })

  it('reports zero when the play head sits in a gap', () => {
    expect(
      getBufferedAhead(
        ranges([
          [0, 10],
          [20, 30],
        ]),
        15,
      ),
    ).toBe(0)
  })

  it('reports zero when nothing is buffered', () => {
    expect(getBufferedAhead(ranges([]), 0)).toBe(0)
  })
})
