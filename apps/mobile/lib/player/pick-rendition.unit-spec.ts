import { pickRendition } from './pick-rendition'

const rendition = (bitrate: number, encrypted = false) => ({
  bitrate,
  codec: 'mp4a.40.2',
  size: 1,
  initRange: [0, 1],
  fragments: [],
  encryption: encrypted ? { scheme: 'cbcs' as const, keyId: 'k' } : null,
})

describe('pickRendition', () => {
  it('picks the highest bitrate that does not exceed the cap', () => {
    expect(pickRendition([rendition(96), rendition(320), rendition(160)], 192)?.bitrate).toBe(160)
  })

  it('falls back to the lowest bitrate when every rendition exceeds the cap', () => {
    expect(pickRendition([rendition(320), rendition(256)], 128)?.bitrate).toBe(256)
  })

  it('skips encrypted renditions the native player cannot decrypt', () => {
    expect(pickRendition([rendition(320, true), rendition(160)], 320)?.bitrate).toBe(160)
  })

  it('returns null when every rendition is encrypted', () => {
    expect(pickRendition([rendition(320, true)], 320)).toBeNull()
  })
})
