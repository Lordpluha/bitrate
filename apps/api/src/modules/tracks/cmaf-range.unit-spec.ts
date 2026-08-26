import { describe, expect, it } from '@jest/globals'
import { resolveRange } from './cmaf-range'
import { UnsatisfiableRangeError } from './track-playback.types'

const FILE_SIZE = 1_000

describe('resolveRange', () => {
  it('serves the whole object when no Range header is present', () => {
    expect(resolveRange(undefined, FILE_SIZE)).toEqual({
      start: 0,
      end: 999,
      contentLength: 1_000,
      isPartial: false,
    })
  })

  it('resolves a closed range inclusively on both ends', () => {
    expect(resolveRange('bytes=100-199', FILE_SIZE)).toEqual({
      start: 100,
      end: 199,
      contentLength: 100,
      isPartial: true,
    })
  })

  it('treats an open-ended range as running to the last byte', () => {
    expect(resolveRange('bytes=900-', FILE_SIZE)).toMatchObject({
      start: 900,
      end: 999,
      contentLength: 100,
    })
  })

  it('resolves a suffix range to the trailing bytes', () => {
    expect(resolveRange('bytes=-100', FILE_SIZE)).toMatchObject({
      start: 900,
      end: 999,
      contentLength: 100,
    })
  })

  it('clamps a suffix longer than the file to the whole file', () => {
    expect(resolveRange('bytes=-5000', FILE_SIZE)).toMatchObject({ start: 0, end: 999 })
  })

  it('clamps an end beyond the last byte', () => {
    expect(resolveRange('bytes=900-99999', FILE_SIZE)).toMatchObject({ start: 900, end: 999 })
  })

  it('requests exactly one fragment when given its offset and length', () => {
    const offset = 929
    const length = 98_987

    const resolved = resolveRange(`bytes=${offset}-${offset + length - 1}`, 1_456_523)

    expect(resolved.contentLength).toBe(length)
  })

  it.each([
    ['bytes=1000-1100', 'start past the end'],
    ['bytes=500-100', 'inverted range'],
    ['bytes=abc-def', 'unparseable range'],
    ['items=0-10', 'unsupported unit'],
    ['bytes=-', 'empty range'],
    ['bytes=-0', 'zero-length suffix'],
  ])('rejects %s as unsatisfiable (%s)', (header) => {
    expect(() => resolveRange(header, FILE_SIZE)).toThrow(UnsatisfiableRangeError)
  })

  it('rejects unsafe integer bounds instead of rounding them', () => {
    expect(() => resolveRange('bytes=999999999999999999999-', FILE_SIZE)).toThrow(
      UnsatisfiableRangeError,
    )
  })
})
