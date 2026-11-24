import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type {
  BitratePlayerElement,
  BitratePlayerFetchRangeInput,
  BitratePlayerLicenseInput,
  BitratePlayerRenditionUrlInput,
  BitratePlayerStreaming,
  TrackManifest,
} from '../contract'
import { configureCmafEngine } from '../engine'
import fixtureManifest from './__fixtures__/cmaf-encrypted/manifest.json'

/**
 * ClearKey `cbcs` playback end to end in Chromium (ADR-0077), on a fixture the converter itself
 * encrypted (`scripts/make-encrypted-cmaf-fixture.mjs`): 192 kbps under the fixture key, a clear
 * 64 kbps copy. If decryption failed, playback would stall at the first encrypted sample.
 */
const KEY_ID = '0123456789abcdef0123456789abcdef'
const KEY = 'fedcba9876543210fedcba9876543210'

const base64Url = (hex: string) =>
  btoa(String.fromCharCode(...(hex.match(/../g) ?? []).map((pair) => Number.parseInt(pair, 16))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

/** The licence `POST /tracks/:id/license` returns for the fixture key. */
const licence = () =>
  new TextEncoder().encode(
    JSON.stringify({
      keys: [{ kty: 'oct', kid: base64Url(KEY_ID), k: base64Url(KEY) }],
      type: 'temporary',
    }),
  ).buffer as ArrayBuffer

const pair = ([start, end]: number[]): readonly [number, number] => {
  if (start === undefined || end === undefined) throw new Error('fixture range is not a pair')
  return [start, end]
}
const quad = ([a, b, c, d]: number[]): readonly [number, number, number, number] => {
  if (a === undefined || b === undefined || c === undefined || d === undefined) {
    throw new Error('fixture fragment is not a quad')
  }
  return [a, b, c, d]
}

const manifest: TrackManifest = {
  version: 1,
  timescale: fixtureManifest.timescale,
  durationTicks: fixtureManifest.durationTicks,
  durationMs: fixtureManifest.durationMs,
  renditions: fixtureManifest.renditions.map((rendition) => ({
    ...rendition,
    initRange: pair(rendition.initRange),
    fragments: rendition.fragments.map(quad),
    encryption: rendition.encryption
      ? { scheme: 'cbcs' as const, keyId: rendition.encryption.keyId }
      : null,
  })),
}

const bytes = new Map<number, ArrayBuffer>()
const fixtureUrl = ({ bitrate }: BitratePlayerRenditionUrlInput) =>
  new URL(`./__fixtures__/cmaf-encrypted/${bitrate}.m4a`, import.meta.url).href

beforeAll(async () => {
  for (const bitrate of [64, 192]) {
    bytes.set(bitrate, await (await fetch(fixtureUrl({ trackId: 't1', bitrate }))).arrayBuffer())
  }
})

const serveRanges = () =>
  vi.fn(async ({ bitrate, range }: BitratePlayerFetchRangeInput) => {
    const file = bytes.get(bitrate)
    if (!file) throw new Error(`no fixture for ${bitrate}k`)
    return file.slice(range[0], range[1] + 1)
  })

async function mount(streaming: Partial<BitratePlayerStreaming>) {
  const { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } = await import('./index')
  await defineBitratePlayer()
  const element: BitratePlayerElement = document.createElement(BITRATE_PLAYER_TAG_NAME)
  element.chrome = 'none'
  document.body.append(element)
  element.streaming = {
    fetchRange: serveRanges(),
    renditionUrl: fixtureUrl,
    resolveManifest: vi.fn(async () => manifest),
    ...streaming,
  }
  await expect.poll(() => element.shadowRoot?.querySelectorAll('audio').length).toBe(2)
  element.source = { key: 'k1', trackId: 't1' }
  return element
}

describe('<bitrate-player> encrypted CMAF (ADR-0077)', () => {
  afterEach(() => {
    document.body.replaceChildren()
    configureCmafEngine({ storage: null })
  })

  it('decrypts the encrypted ladder through ClearKey with the host licence', async () => {
    const fetchRange = serveRanges()
    const requestLicense = vi.fn(async (_input: BitratePlayerLicenseInput) => licence())
    const element = await mount({ fetchRange, requestLicense })

    await element.play()

    await expect.poll(() => element.state.status, { timeout: 8_000 }).toBe('playing')
    await expect.poll(() => element.state.currentTime, { timeout: 8_000 }).toBeGreaterThan(1.5)
    expect(requestLicense).toHaveBeenCalledWith(expect.objectContaining({ trackId: 't1' }))
    expect(fetchRange).toHaveBeenCalledWith(
      expect.objectContaining({ bitrate: 192, encrypted: true }),
    )
    expect(fetchRange).not.toHaveBeenCalledWith(expect.objectContaining({ bitrate: 64 }))
  })

  it('plays the clear rendition when the host cannot request licences', async () => {
    const fetchRange = serveRanges()
    const element = await mount({ fetchRange })

    await element.play()

    await expect.poll(() => element.state.currentTime, { timeout: 8_000 }).toBeGreaterThan(1.5)
    expect(fetchRange).toHaveBeenCalledWith(expect.objectContaining({ bitrate: 64 }))
    expect(fetchRange).not.toHaveBeenCalledWith(expect.objectContaining({ encrypted: true }))
  })

  it('falls back to the clear rendition when the licence is refused', async () => {
    const requestLicense = vi.fn(async () => {
      throw Object.assign(new Error('HTTP 403'), { status: 403 })
    })
    const element = await mount({ requestLicense })

    await element.play()

    await expect.poll(() => element.state.currentTime, { timeout: 8_000 }).toBeGreaterThan(1.5)
    const audio = element.shadowRoot?.querySelector('audio') as HTMLAudioElement
    expect(audio.src).toMatch(/cmaf-encrypted\/64\.m4a$/)
  })
})
