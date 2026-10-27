import { describe, expect, it } from 'vitest'
import { type MediaTiming, shouldDelayInitialPlayback, shouldPrefetchNextTrack } from './network'

/**
 * The prefetch and constrained-start thresholds web-player's characterisation spec pinned
 * before they moved here; `constrained` replaces its `navigator.connection` reading.
 */
type MediaShape = {
  currentTime: number
  duration: number
  paused?: boolean
  buffered?: [number, number][]
}

const media = ({ buffered = [], paused = false, ...rest }: MediaShape): MediaTiming => ({
  ...rest,
  buffered: {
    end: (index: number) => buffered[index]?.[1] ?? 0,
    length: buffered.length,
    start: (index: number) => buffered[index]?.[0] ?? 0,
  },
  paused,
})

describe('shouldPrefetchNextTrack', () => {
  it('waits until 45 s remain and 8 s are buffered on a normal connection', () => {
    expect(
      shouldPrefetchNextTrack(
        media({ buffered: [[150, 160]], currentTime: 150, duration: 200 }),
        false,
      ),
    ).toBe(false)
    expect(
      shouldPrefetchNextTrack(
        media({ buffered: [[160, 170]], currentTime: 160, duration: 200 }),
        false,
      ),
    ).toBe(true)
    expect(
      shouldPrefetchNextTrack(
        media({ buffered: [[160, 165]], currentTime: 160, duration: 200 }),
        false,
      ),
    ).toBe(false)
  })

  it('prefetches near the end while paused even with little buffered', () => {
    expect(
      shouldPrefetchNextTrack(media({ currentTime: 170, duration: 200, paused: true }), false),
    ).toBe(true)
  })

  it('waits until 30 s remain on a constrained connection', () => {
    expect(
      shouldPrefetchNextTrack(
        media({ buffered: [[160, 170]], currentTime: 160, duration: 200 }),
        true,
      ),
    ).toBe(false)
    expect(
      shouldPrefetchNextTrack(
        media({ buffered: [[175, 185]], currentTime: 175, duration: 200 }),
        true,
      ),
    ).toBe(true)
  })

  it('never prefetches while the duration is unknown', () => {
    expect(
      shouldPrefetchNextTrack(media({ currentTime: 0, duration: Number.NaN, paused: true }), false),
    ).toBe(false)
  })
})

describe('shouldDelayInitialPlayback', () => {
  it('holds the first play on a constrained connection until 3 s are buffered', () => {
    expect(
      shouldDelayInitialPlayback(
        media({ buffered: [[0, 1]], currentTime: 0, duration: 200 }),
        true,
      ),
    ).toBe(true)
    expect(
      shouldDelayInitialPlayback(
        media({ buffered: [[0, 4]], currentTime: 0, duration: 200 }),
        true,
      ),
    ).toBe(false)
  })

  it('never holds playback on a normal connection or once playback has started', () => {
    expect(shouldDelayInitialPlayback(media({ currentTime: 0, duration: 200 }), false)).toBe(false)
    expect(shouldDelayInitialPlayback(media({ currentTime: 5, duration: 200 }), true)).toBe(false)
  })
})
