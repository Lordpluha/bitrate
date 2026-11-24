import { describe, expect, it } from 'vitest'
import { trackManifestSchema } from './trackManifest.schema'

const validManifest = () => ({
  durationMs: 2_000,
  durationTicks: 96_000,
  renditions: [128, 320].map((bitrate) => ({
    bitrate,
    codec: 'mp4a.40.2',
    fragments: [
      [0, 48_000, 100, 40],
      [48_000, 48_000, 140, 40],
    ],
    initRange: [0, 99],
    size: 180,
  })),
  timescale: 48_000,
  version: 1,
})

type ManifestFixture = ReturnType<typeof validManifest>

const getRendition = (manifest: ManifestFixture, index: number) => {
  const rendition = manifest.renditions[index]
  if (!rendition) throw new Error(`Missing rendition fixture at index ${index}`)
  return rendition
}

const getFragment = (
  manifest: ManifestFixture,
  rendition: number,
  index: number,
) => {
  const fragment = getRendition(manifest, rendition).fragments[index]
  if (!fragment) throw new Error(`Missing fragment fixture at index ${index}`)
  return fragment
}

describe('trackManifestSchema', () => {
  it('accepts an aligned version-one manifest', () => {
    expect(trackManifestSchema.safeParse(validManifest()).success).toBe(true)
  })

  describe('encrypted renditions (ADR-0077)', () => {
    const keyId = '0123456789abcdef0123456789abcdef'
    const encryptedTrack = () => {
      const manifest = validManifest()
      const [clear, high] = manifest.renditions
      return {
        ...manifest,
        renditions: [
          { ...clear, encryption: null },
          { ...clear, encryption: { scheme: 'cbcs', keyId } },
          { ...high, encryption: { scheme: 'cbcs', keyId } },
        ],
      }
    }

    it('keeps the encryption of each rendition, a clear and an encrypted one per bitrate', () => {
      const parsed = trackManifestSchema.parse(encryptedTrack())

      expect(
        parsed.renditions.map((rendition) => rendition.encryption),
      ).toEqual([null, { scheme: 'cbcs', keyId }, { scheme: 'cbcs', keyId }])
    })

    it('still rejects two renditions of one bitrate with the same encryption', () => {
      const manifest = encryptedTrack()
      const [first, second] = manifest.renditions

      expect(
        trackManifestSchema.safeParse({
          ...manifest,
          renditions: [first, first, second],
        }).success,
      ).toBe(false)
    })

    it('rejects an encrypted rendition listed before the clear one of its bitrate', () => {
      const manifest = encryptedTrack()
      const [clear, encrypted, high] = manifest.renditions

      expect(
        trackManifestSchema.safeParse({
          ...manifest,
          renditions: [encrypted, clear, high],
        }).success,
      ).toBe(false)
    })

    it('rejects a key id that is not 128-bit hex', () => {
      const manifest = encryptedTrack()
      const [clear, encrypted, high] = manifest.renditions

      expect(
        trackManifestSchema.safeParse({
          ...manifest,
          renditions: [
            clear,
            { ...encrypted, encryption: { scheme: 'cbcs', keyId: 'x' } },
            high,
          ],
        }).success,
      ).toBe(false)
    })
  })

  it.each([
    [
      'unsupported version',
      (value: ManifestFixture) => {
        value.version = 2
      },
    ],
    [
      'zero timescale',
      (value: ManifestFixture) => {
        value.timescale = 0
      },
    ],
    [
      'empty codec',
      (value: ManifestFixture) => {
        getRendition(value, 0).codec = ' '
      },
    ],
    [
      'shifted initialization range',
      (value: ManifestFixture) => {
        getRendition(value, 0).initRange[0] = 1
      },
    ],
    [
      'out-of-bounds bytes',
      (value: ManifestFixture) => {
        getFragment(value, 0, 1)[3] = 100
      },
    ],
    [
      'overlapping timeline',
      (value: ManifestFixture) => {
        getFragment(value, 0, 1)[0] = 40_000
      },
    ],
    [
      'gapped timeline',
      (value: ManifestFixture) => {
        getFragment(value, 0, 1)[0] = 50_000
      },
    ],
    [
      'overlapping byte ranges',
      (value: ManifestFixture) => {
        getFragment(value, 0, 1)[2] = 130
      },
    ],
    [
      'incomplete duration',
      (value: ManifestFixture) => {
        getFragment(value, 0, 1)[1] = 47_000
        getFragment(value, 1, 1)[1] = 47_000
      },
    ],
    [
      'unaligned renditions',
      (value: ManifestFixture) => {
        getFragment(value, 1, 0)[1] = 47_000
      },
    ],
  ])('rejects %s', (_label, mutate) => {
    const value = validManifest()
    mutate(value)

    expect(trackManifestSchema.safeParse(value).success).toBe(false)
  })
})
