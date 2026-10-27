import { afterEach, describe, expect, it, vi } from 'vitest'
import { bufferedRanges } from '@/entities/Player/lib/__tests__/mediaSourceFakes'
import {
  shouldDelayInitialPlayback,
  shouldPrefetchNextTrack,
} from './audioPlayer.utils'

/**
 * Characterises when the standby slot starts loading the next track and when a
 * slow connection holds the first play — the thresholds the shared engine's
 * prefetch must keep after the migration.
 */
type MediaShape = {
  currentTime: number
  duration: number
  paused?: boolean
  buffered?: [number, number][]
}

const media = ({ buffered = [], paused = false, ...rest }: MediaShape) =>
  ({
    ...rest,
    buffered: bufferedRanges(buffered),
    paused,
  }) as unknown as HTMLAudioElement

const setConnection = (connection: object | undefined) => {
  vi.stubGlobal('navigator', { ...navigator, connection })
}

describe('shouldPrefetchNextTrack', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('waits until 45 s remain and 8 s are buffered on a normal connection', () => {
    setConnection(undefined)

    expect(
      shouldPrefetchNextTrack(
        media({ buffered: [[150, 160]], currentTime: 150, duration: 200 }),
      ),
    ).toBe(false)
    expect(
      shouldPrefetchNextTrack(
        media({ buffered: [[160, 170]], currentTime: 160, duration: 200 }),
      ),
    ).toBe(true)
    expect(
      shouldPrefetchNextTrack(
        media({ buffered: [[160, 165]], currentTime: 160, duration: 200 }),
      ),
    ).toBe(false)
  })

  it('prefetches near the end while paused even with little buffered', () => {
    setConnection(undefined)

    expect(
      shouldPrefetchNextTrack(
        media({ currentTime: 170, duration: 200, paused: true }),
      ),
    ).toBe(true)
  })

  it('waits until 30 s remain on a slow connection', () => {
    setConnection({ effectiveType: '3g' })

    expect(
      shouldPrefetchNextTrack(
        media({ buffered: [[160, 170]], currentTime: 160, duration: 200 }),
      ),
    ).toBe(false)
    expect(
      shouldPrefetchNextTrack(
        media({ buffered: [[175, 185]], currentTime: 175, duration: 200 }),
      ),
    ).toBe(true)
  })

  it('never prefetches while the duration is unknown', () => {
    setConnection(undefined)

    expect(
      shouldPrefetchNextTrack(
        media({ currentTime: 0, duration: Number.NaN, paused: true }),
      ),
    ).toBe(false)
  })
})

describe('shouldDelayInitialPlayback', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('holds the first play on a slow or data-saving connection until 3 s are buffered', () => {
    setConnection({ saveData: true })

    expect(
      shouldDelayInitialPlayback(
        media({ buffered: [[0, 1]], currentTime: 0, duration: 200 }),
      ),
    ).toBe(true)
    expect(
      shouldDelayInitialPlayback(
        media({ buffered: [[0, 4]], currentTime: 0, duration: 200 }),
      ),
    ).toBe(false)
  })

  it('never holds playback on a normal connection or once playback has started', () => {
    setConnection(undefined)
    expect(
      shouldDelayInitialPlayback(media({ currentTime: 0, duration: 200 })),
    ).toBe(false)

    setConnection({ effectiveType: '2g' })
    expect(
      shouldDelayInitialPlayback(media({ currentTime: 5, duration: 200 })),
    ).toBe(false)
  })
})
