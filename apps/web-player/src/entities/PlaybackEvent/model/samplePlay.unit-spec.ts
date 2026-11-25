import { describe, expect, it } from 'vitest'
import type { PlaySample, TrackedPlay } from './playbackEvent.types'
import { samplePlay } from './samplePlay'

const sample = (currentTime: number, isPlaying = true): PlaySample => ({
  currentTime,
  duration: 200,
  isPlaying,
})

const play = (last: PlaySample, listenedMs = 0): TrackedPlay => ({
  clientPlayId: 'play-1',
  trackId: 'track-1',
  startedAt: '2026-11-23T10:00:00.000Z',
  listenedMs,
  last,
  source: 'OTHER',
})

describe('samplePlay', () => {
  it('counts the audio heard between two playing ticks', () => {
    const next = samplePlay({
      play: play(sample(10), 500),
      sample: sample(10.25),
    })

    expect(next.listenedMs).toBe(750)
    expect(next.last).toEqual(sample(10.25))
  })

  it('does not count a seek forward', () => {
    expect(
      samplePlay({ play: play(sample(10)), sample: sample(90) }).listenedMs,
    ).toBe(0)
  })

  it('does not count a seek back', () => {
    expect(
      samplePlay({ play: play(sample(90)), sample: sample(10) }).listenedMs,
    ).toBe(0)
  })

  it('does not count time while paused, nor the tick that resumes playback', () => {
    const paused = samplePlay({
      play: play(sample(10)),
      sample: sample(10.25, false),
    })
    const resumed = samplePlay({ play: paused, sample: sample(10.5) })

    expect(paused.listenedMs).toBe(0)
    expect(resumed.listenedMs).toBe(0)
  })
})
