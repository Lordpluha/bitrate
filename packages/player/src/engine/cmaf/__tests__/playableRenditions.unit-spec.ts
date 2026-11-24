import { describe, expect, it } from 'vitest'
import type { ManifestRendition, TrackManifest } from '../manifest'
import { selectPlayableRenditions } from '../playableRenditions'

const KEY_ID = '0123456789abcdef0123456789abcdef'

const rendition = (bitrate: number, encrypted: boolean): ManifestRendition => ({
  bitrate,
  codec: 'mp4a.40.2',
  size: 1000,
  initRange: [0, 99],
  fragments: [[0, 480_000, 100, 900]],
  encryption: encrypted ? { scheme: 'cbcs', keyId: KEY_ID } : null,
})

const manifest = (renditions: ManifestRendition[]): TrackManifest => ({
  version: 1,
  timescale: 48_000,
  durationTicks: 480_000,
  durationMs: 10_000,
  renditions,
})

const bitrates = (result: TrackManifest | null) =>
  result?.renditions.map((entry) => `${entry.bitrate}${entry.encryption ? 'e' : 'c'}`)

describe('selectPlayableRenditions (ADR-0077)', () => {
  const encryptedTrack = manifest([
    rendition(128, false),
    rendition(128, true),
    rendition(320, true),
  ])

  it('plays only the encrypted ladder when the browser can decrypt', () => {
    expect(bitrates(selectPlayableRenditions(encryptedTrack, true))).toEqual(['128e', '320e'])
  })

  it('falls back to the clear renditions when it cannot', () => {
    expect(bitrates(selectPlayableRenditions(encryptedTrack, false))).toEqual(['128c'])
  })

  it('keeps an unencrypted track as it is, whatever the browser supports', () => {
    const clearTrack = manifest([rendition(128, false), rendition(192, false)])

    expect(bitrates(selectPlayableRenditions(clearTrack, true))).toEqual(['128c', '192c'])
    expect(bitrates(selectPlayableRenditions(clearTrack, false))).toEqual(['128c', '192c'])
  })

  it('treats a rendition without the field as clear, as older manifests send it', () => {
    const legacy = manifest([{ ...rendition(128, false), encryption: undefined }])

    expect(bitrates(selectPlayableRenditions(legacy, false))).toEqual(['128c'])
  })

  it('returns null when nothing is playable', () => {
    expect(selectPlayableRenditions(manifest([rendition(320, true)]), false)).toBeNull()
  })
})
