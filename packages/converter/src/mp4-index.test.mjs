import { describe, expect, it } from 'vitest'

import { assertAlignedRenditions, buildFragmentIndex, parseSidx, readBoxes } from './mp4-index.mjs'

/** Writes a box header plus payload. */
const box = (type, payload = Buffer.alloc(0)) => {
  const header = Buffer.alloc(8)
  header.writeUInt32BE(8 + payload.length, 0)
  header.write(type, 4, 'latin1')
  return Buffer.concat([header, payload])
}

/**
 * Builds a minimal sidx payload.
 * @param {{timescale?: number, firstOffset?: number, entries: [number, number][]}} input
 */
const sidxPayload = ({ timescale = 48000, firstOffset = 0, entries }) => {
  const head = Buffer.alloc(20)
  head.writeUInt8(0, 0) // version 0
  head.writeUInt32BE(1, 4) // reference_ID
  head.writeUInt32BE(timescale, 8)
  head.writeUInt32BE(0, 12) // earliest_presentation_time
  head.writeUInt32BE(firstOffset, 16)

  const counts = Buffer.alloc(4)
  counts.writeUInt16BE(0, 0) // reserved
  counts.writeUInt16BE(entries.length, 2)

  const refs = Buffer.concat(
    entries.map(([size, duration]) => {
      const entry = Buffer.alloc(12)
      entry.writeUInt32BE(size & 0x7fffffff, 0)
      entry.writeUInt32BE(duration, 4)
      entry.writeUInt32BE(0, 8)
      return entry
    }),
  )

  return Buffer.concat([head, counts, refs])
}

/** ftyp + moov + sidx + fragment bytes, like `-movflags +cmaf+global_sidx` produces. */
const buildFile = ({ entries, moovSize = 100 }) => {
  const ftyp = box('ftyp', Buffer.alloc(16))
  const moov = box('moov', Buffer.alloc(moovSize))
  const sidx = box('sidx', sidxPayload({ entries }))
  const media = Buffer.alloc(entries.reduce((total, [size]) => total + size, 0))
  return Buffer.concat([ftyp, moov, sidx, media])
}

describe('readBoxes', () => {
  it('reads top-level boxes with their byte ranges', () => {
    const data = Buffer.concat([box('ftyp', Buffer.alloc(4)), box('moov', Buffer.alloc(8))])

    expect(readBoxes(data)).toEqual([
      { type: 'ftyp', start: 0, end: 12, payload: 8 },
      { type: 'moov', start: 12, end: 28, payload: 20 },
    ])
  })

  it('stops on a truncated trailing box instead of looping', () => {
    const data = Buffer.concat([box('ftyp'), Buffer.from([0, 0, 0])])

    expect(readBoxes(data)).toHaveLength(1)
  })
})

describe('parseSidx', () => {
  it('turns references into absolute offsets and cumulative times', () => {
    const payload = sidxPayload({
      entries: [
        [1000, 4096],
        [1200, 4096],
      ],
    })
    const data = Buffer.concat([box('sidx', payload)])
    const [sidx] = readBoxes(data)

    const { timescale, fragments } = parseSidx(data, sidx)

    expect(timescale).toBe(48000)
    expect(fragments).toEqual([
      { startTicks: 0, durationTicks: 4096, offset: data.length, length: 1000 },
      { startTicks: 4096, durationTicks: 4096, offset: data.length + 1000, length: 1200 },
    ])
  })

  it('rejects a nested sidx rather than producing wrong offsets', () => {
    const payload = sidxPayload({ entries: [[1000, 4096]] })
    payload.writeUInt32BE((0x80000000 | 1000) >>> 0, 24)
    const data = Buffer.concat([box('sidx', payload)])
    const [sidx] = readBoxes(data)

    expect(() => parseSidx(data, sidx)).toThrow(/nested indexes/)
  })
})

describe('buildFragmentIndex', () => {
  it('separates the MSE init segment from the sidx range', () => {
    const data = buildFile({
      entries: [
        [500, 4096],
        [600, 4096],
      ],
    })

    const index = buildFragmentIndex(data)

    /** ftyp(24) + moov(108) => init ends at 131, sidx follows. */
    expect(index.initRange).toEqual([0, 131])
    expect(index.indexRange[0]).toBe(132)
    expect(index.fragments[0].offset).toBe(index.indexRange[1] + 1)
    expect(index.durationTicks).toBe(8192)
  })

  it('explains how to fix a file encoded without a global sidx', () => {
    const data = Buffer.concat([box('ftyp'), box('moov', Buffer.alloc(20))])

    expect(() => buildFragmentIndex(data)).toThrow(/global_sidx/)
  })

  it('rejects input that is not an MP4', () => {
    expect(() => buildFragmentIndex(Buffer.alloc(32))).toThrow(/not an MP4/)
  })
})

describe('assertAlignedRenditions', () => {
  const rendition = (bitrate, fragments, timescale = 48000) => ({
    bitrate,
    index: { timescale, fragments },
  })

  const aligned = [
    { startTicks: 0, durationTicks: 195584 },
    { startTicks: 195584, durationTicks: 196608 },
  ]

  it('accepts renditions sharing identical boundaries', () => {
    expect(() =>
      assertAlignedRenditions([rendition(128, aligned), rendition(320, aligned)]),
    ).not.toThrow()
  })

  it('names the fragment where boundaries diverge', () => {
    const drifted = [aligned[0], { startTicks: 195584, durationTicks: 196607 }]

    expect(() =>
      assertAlignedRenditions([rendition(128, aligned), rendition(320, drifted)]),
    ).toThrow(/fragment 1/)
  })

  it('rejects a differing fragment count', () => {
    expect(() =>
      assertAlignedRenditions([rendition(128, aligned), rendition(320, [aligned[0]])]),
    ).toThrow(/1 fragments, expected 2/)
  })

  it('rejects a differing timescale', () => {
    expect(() =>
      assertAlignedRenditions([rendition(128, aligned), rendition(320, aligned, 44100)]),
    ).toThrow(/timescale 44100/)
  })
})
