import { afterEach, beforeEach, describe, expect, it } from 'vitest'

/**
 * ADR-0067 (D15): the API serves a `Range` of at most one fragment (~10 s) exactly and paces every
 * longer or missing range to real time, so a track cannot be downloaded whole at once. Browsers
 * without MSE play through a plain `<audio>`; WebKit asks for the file without a `Range` and
 * expects one long response, so a hard per-request cap would break it (measured: it stalled or
 * failed with `NotSupportedError`). This proves a real media element loads a whole rendition and
 * reaches its last second under the rule, in Chromium and WebKit (`native` project), against the
 * `/__capped-cmaf/` model in `scripts/capped-cmaf-fixture.mjs`. Headless WebKit on Linux never
 * advances its playback clock, even uncapped, so the spec checks data and seeking, not `ended`.
 */
type ServedResponse = {
  range: string | null
  kind: 'exact' | 'paced'
  served: number
  cap: number
}

const HAVE_ENOUGH_DATA = 4

const servedLog = async (): Promise<ServedResponse[]> =>
  (await fetch('/__capped-cmaf/log')).json() as Promise<ServedResponse[]>

const once = (target: EventTarget, type: string) =>
  new Promise<void>((resolve) => target.addEventListener(type, () => resolve(), { once: true }))

describe('native <audio> under the one-fragment-or-paced rule', () => {
  beforeEach(async () => {
    await fetch('/__capped-cmaf/log', { method: 'DELETE' })
  })

  afterEach(() => {
    document.body.replaceChildren()
  })

  it(
    'loads the whole rendition and reaches its last second, with no exact response over one fragment',
    { timeout: 30_000 },
    async () => {
      const audio = document.createElement('audio')
      audio.muted = true
      audio.src = '/__capped-cmaf/192.m4a'
      document.body.append(audio)

      await audio.play()
      await expect
        .poll(() => audio.readyState, { timeout: 15_000, interval: 100 })
        .toBe(HAVE_ENOUGH_DATA)
      expect(audio.duration).toBeGreaterThan(11)

      const seeked = once(audio, 'seeked')
      audio.currentTime = audio.duration - 0.5
      await seeked
      await expect
        .poll(() => audio.readyState, { timeout: 15_000, interval: 100 })
        .toBeGreaterThanOrEqual(3)
      expect(audio.error).toBeNull()

      const log = await servedLog()
      expect(log.length).toBeGreaterThan(0)
      for (const entry of log.filter(({ kind }) => kind === 'exact')) {
        expect(entry.served).toBeLessThanOrEqual(entry.cap)
      }
    },
  )
})
