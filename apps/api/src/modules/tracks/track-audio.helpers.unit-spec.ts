import { describe, expect, it } from '@jest/globals'
import { BadRequestException } from '@nestjs/common'
import {
  getContentType,
  getHlsAssetContentType,
  getTargetBitrates,
  isAllowedHlsAsset,
  parseRangeHeader,
  selectPreferredTrackFile,
} from './track-audio.helpers'

describe('getTargetBitrates', () => {
  it('falls back to the full ladder when the source bitrate is unknown', () => {
    expect(getTargetBitrates(0)).toEqual(['128k', '192k', '320k'])
  })

  it('never transcodes above the source bitrate', () => {
    expect(getTargetBitrates(192)).toEqual(['128k', '192k'])
  })

  it('keeps a source quieter than every rung at its own bitrate', () => {
    expect(getTargetBitrates(64)).toEqual(['64k'])
  })

  it('rejects a source below the converter minimum', () => {
    expect(() => getTargetBitrates(31)).toThrow(BadRequestException)
  })
})

describe('getContentType', () => {
  it.each([
    ['track.mp3', 'audio/mpeg'],
    ['track.opus', 'audio/ogg'],
    ['track.ogg', 'audio/ogg'],
    ['track.wav', 'audio/wav'],
    ['track.webm', 'audio/webm'],
    ['track.bin', 'application/octet-stream'],
  ])('maps %s to %s', (fileName, expected) => {
    expect(getContentType(fileName)).toBe(expected)
  })
})

describe('isAllowedHlsAsset', () => {
  it.each(['index.m3u8', 'init_1.mp4', 'segment_00042.m4s'])('accepts %s', (asset) => {
    expect(isAllowedHlsAsset(asset)).toBe(true)
  })

  it.each([
    '../../etc/passwd',
    'segment_1.m4s',
    'master.m3u8',
    'index.m3u8/../x',
  ])('rejects %s', (asset) => {
    expect(isAllowedHlsAsset(asset)).toBe(false)
  })
})

describe('getHlsAssetContentType', () => {
  it.each([
    ['index.m3u8', 'application/vnd.apple.mpegurl'],
    ['init_1.mp4', 'video/mp4'],
    ['segment_00001.m4s', 'video/iso.segment'],
  ])('maps %s to %s', (asset, expected) => {
    expect(getHlsAssetContentType(asset)).toBe(expected)
  })
})

describe('selectPreferredTrackFile', () => {
  const files = [
    { format: 'opus', bitrate: 128 },
    { format: 'opus', bitrate: 192 },
    { format: 'opus', bitrate: 320 },
    { format: 'mp3', bitrate: 256 },
  ]

  it('returns the highest rendition when no bitrate is requested', () => {
    expect(selectPreferredTrackFile({ files, preferredFormat: 'opus' })).toEqual({
      format: 'opus',
      bitrate: 320,
    })
  })

  it('never exceeds the requested bitrate', () => {
    expect(
      selectPreferredTrackFile({ files, preferredBitrate: 256, preferredFormat: 'opus' }),
    ).toEqual({ format: 'opus', bitrate: 192 })
  })

  it('falls back to the lowest rendition when every option is too rich', () => {
    expect(
      selectPreferredTrackFile({ files, preferredBitrate: 64, preferredFormat: 'opus' }),
    ).toEqual({ format: 'opus', bitrate: 128 })
  })

  it('ignores the preferred format when nothing is stored in it', () => {
    expect(selectPreferredTrackFile({ files, preferredFormat: 'flac' })).toEqual({
      format: 'mp3',
      bitrate: 256,
    })
  })

  it('returns undefined for an empty file list', () => {
    expect(selectPreferredTrackFile({ files: [], preferredFormat: 'opus' })).toBeUndefined()
  })
})

describe('parseRangeHeader', () => {
  it('parses a closed range', () => {
    expect(parseRangeHeader('bytes=100-999', 2048)).toEqual({ start: 100, end: 999 })
  })

  it('treats an open end as the rest of the file', () => {
    expect(parseRangeHeader('bytes=100-', 2048)).toEqual({ start: 100, end: 2047 })
  })

  it('resolves a suffix range against the file size', () => {
    expect(parseRangeHeader('bytes=-500', 2048)).toEqual({ start: 1548, end: 2047 })
  })

  it('clamps a suffix longer than the file to the whole file', () => {
    expect(parseRangeHeader('bytes=-9999', 2048)).toEqual({ start: 0, end: 2047 })
  })

  it('clamps an end past the file size', () => {
    expect(parseRangeHeader('bytes=0-9999', 2048)).toEqual({ start: 0, end: 2047 })
  })

  it.each(['bytes=-', 'bytes=abc-def', 'items=0-10', 'bytes=900-100'])('rejects %s', (header) => {
    expect(() => parseRangeHeader(header, 2048)).toThrow(BadRequestException)
  })

  it('rejects a start beyond the end of the file', () => {
    expect(() => parseRangeHeader('bytes=5000-', 2048)).toThrow(BadRequestException)
  })
})
