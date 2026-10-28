import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type {
  BitratePlayerElement,
  BitratePlayerFetchRangeInput,
  BitratePlayerStateDetail,
  BitratePlayerStreaming,
  TrackManifest,
} from '../contract'
import { configureCmafEngine } from '../engine'
import fixtureManifest from './__fixtures__/cmaf/manifest.json'
import { resolveSilentSource } from './stories/fixtures'

/**
 * The CMAF/MSE path end to end in Chromium, on a fixture made by the API's own
 * `convertAudioToCmaf` (`scripts/make-cmaf-fixture.mjs`): 12 one-second fragments at 64 and
 * 192 kbps. `fetchRange` serves byte ranges of the fixture files and can be slowed down, which
 * is exactly what the adaptive bitrate measures — no network throttling needed.
 */
/** JSON has no tuples; rebuild them, failing loudly if the fixture's shape ever drifts. */
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

if (fixtureManifest.version !== 1) throw new Error('fixture manifest is not version 1')

const manifest: TrackManifest = {
  version: 1,
  timescale: fixtureManifest.timescale,
  durationTicks: fixtureManifest.durationTicks,
  durationMs: fixtureManifest.durationMs,
  renditions: fixtureManifest.renditions.map((rendition) => ({
    ...rendition,
    initRange: pair(rendition.initRange),
    fragments: rendition.fragments.map(quad),
  })),
}
const renditionBytes = new Map<number, ArrayBuffer>()

beforeAll(async () => {
  for (const bitrate of [64, 192]) {
    const url = new URL(`./__fixtures__/cmaf/${bitrate}.m4a`, import.meta.url)
    renditionBytes.set(bitrate, await (await fetch(url)).arrayBuffer())
  }
})

type ServeInput = {
  /** Milliseconds each range takes, read per request. */
  delayMs?: () => number
  fail?: boolean
}

const serveRanges = ({ delayMs = () => 0, fail = false }: ServeInput = {}) =>
  vi.fn(async ({ bitrate, range }: BitratePlayerFetchRangeInput) => {
    if (fail) throw Object.assign(new Error('HTTP 404'), { status: 404 })
    await new Promise((resolve) => setTimeout(resolve, delayMs()))
    const bytes = renditionBytes.get(bitrate)
    if (!bytes) throw new Error(`no fixture for ${bitrate}k`)
    return bytes.slice(range[0], range[1] + 1)
  })

const memoryStorage = (entries: Record<string, string> = {}) => {
  const store = new Map(Object.entries(entries))
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
  }
}

/** A remembered 10 Mbps, so the first fragment opens on the top rung. */
const fastConnection = () =>
  memoryStorage({
    'player-throughput': JSON.stringify({ bps: 10_000_000, savedAtMs: Date.now() }),
  })

async function mountCmaf(streaming: Partial<BitratePlayerStreaming>) {
  const { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } = await import('./index')
  await defineBitratePlayer()
  const element: BitratePlayerElement = document.createElement(BITRATE_PLAYER_TAG_NAME)
  element.chrome = 'none'
  document.body.append(element)
  const bitrates: number[] = []
  element.addEventListener('statechange', (event) => {
    const { bitrate } = (event as CustomEvent<BitratePlayerStateDetail>).detail
    if (bitrate !== null && bitrates.at(-1) !== bitrate) bitrates.push(bitrate)
  })
  element.streaming = {
    fetchRange: serveRanges(),
    resolveManifest: vi.fn(async () => manifest),
    ...streaming,
  }
  await expect.poll(() => element.shadowRoot?.querySelectorAll('audio').length).toBe(2)
  element.source = {
    key: 'k1',
    trackId: 't1',
    progressiveUrl: await resolveSilentSource({ bitrate: null }),
  }
  return { bitrates, element }
}

const heard = (element: BitratePlayerElement) =>
  element.shadowRoot?.querySelector('audio') as HTMLAudioElement

describe('<bitrate-player> CMAF path', () => {
  afterEach(() => {
    document.body.replaceChildren()
    configureCmafEngine({ storage: null })
  })

  it('plays through Media Source Extensions with fragment range requests', async () => {
    configureCmafEngine({ storage: fastConnection() })
    const fetchRange = serveRanges()
    const { element } = await mountCmaf({ fetchRange })

    await element.play()

    await expect.poll(() => element.state.status, { timeout: 5_000 }).toBe('playing')
    expect(heard(element).src).toMatch(/^blob:/)
    expect(fetchRange).toHaveBeenCalledWith(
      expect.objectContaining({ expectedSize: expect.any(Number), trackId: 't1' }),
    )
    await expect.poll(() => element.state.currentTime, { timeout: 5_000 }).toBeGreaterThan(0.5)
  })

  it('lets the listener pin a rendition and go back to Auto', async () => {
    configureCmafEngine({ storage: fastConnection() })
    const { bitrates, element } = await mountCmaf({})
    element.chrome = 'bar'
    await element.play()

    const select = await vi.waitFor(() => {
      const found = element.shadowRoot?.querySelector('select')
      if (!(found instanceof HTMLSelectElement)) throw new Error('quality select not shown yet')
      return found
    })
    expect([...select.options].map((option) => option.textContent?.trim())).toEqual([
      'Auto',
      '64 kbps',
      '192 kbps',
    ])
    expect(select.value).toBe('auto')

    select.value = '64'
    select.dispatchEvent(new Event('change', { bubbles: true }))
    await expect.poll(() => element.state.autoBitrate).toBe(false)
    await expect.poll(() => bitrates.at(-1), { timeout: 5_000 }).toBe(64)

    /** The pin carries over to the next play instead of reopening on the top rung. */
    element.source = { key: 'k2', trackId: 't2', progressiveUrl: '' }
    await expect.poll(() => element.state.key).toBe('k2')
    await expect.poll(() => element.state.bitrate).toBe(64)
    expect(element.state.autoBitrate).toBe(false)

    /** The select re-renders for the new track's ladder; take the current one. */
    const current = element.shadowRoot?.querySelector('select')
    if (!(current instanceof HTMLSelectElement)) throw new Error('quality select missing')
    expect(current.value).toBe('64')
    current.value = 'auto'
    current.dispatchEvent(new Event('change', { bubbles: true }))
    await expect.poll(() => element.state.autoBitrate).toBe(true)
  })

  it('opens on the top rung and drops to the floor once fragments arrive too slowly', async () => {
    /**
     * A remembered 600 kbps affords 192 kbps to open with; 24 KB fragments taking 1.5 s
     * (~130 kbps) then pull the smoothed estimate under it within a few fragments.
     */
    configureCmafEngine({
      storage: memoryStorage({
        'player-throughput': JSON.stringify({ bps: 600_000, savedAtMs: Date.now() }),
      }),
    })
    const { bitrates, element } = await mountCmaf({
      fetchRange: serveRanges({ delayMs: () => 1_500 }),
    })

    await element.play()

    await expect.poll(() => bitrates, { timeout: 20_000 }).toEqual([192, 64])
  })

  it('seeks into a part that is not buffered yet and keeps playing from there', async () => {
    configureCmafEngine({ storage: fastConnection() })
    const fetchRange = serveRanges()
    const { element } = await mountCmaf({ fetchRange })
    await element.play()
    await expect.poll(() => element.state.status, { timeout: 5_000 }).toBe('playing')

    element.seek(9)

    await expect.poll(() => element.state.currentTime, { timeout: 5_000 }).toBeGreaterThan(9)
    const ranges = fetchRange.mock.calls.map(([input]) => input.range[0])
    const ninth = manifest.renditions[1]?.fragments[9]?.[2]
    expect(ranges).toContain(ninth)
  })

  it('falls back to the progressive file when fragments cannot be loaded', async () => {
    configureCmafEngine({ storage: fastConnection() })
    const { element } = await mountCmaf({ fetchRange: serveRanges({ fail: true }) })

    await element.play()

    await expect.poll(() => heard(element).src, { timeout: 5_000 }).toMatch(/^blob:/)
    await expect.poll(() => element.state.status, { timeout: 5_000 }).toBe('playing')
    expect(element.state.bitrate).toBeNull()
  })
})
