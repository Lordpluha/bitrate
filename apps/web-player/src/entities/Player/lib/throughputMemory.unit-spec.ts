import { beforeEach, describe, expect, it } from 'vitest'

import type { TrackManifest } from '@/entities/Player/model/manifest.types'
import {
  pickStartBitrate,
  readRememberedThroughput,
  rememberThroughput,
} from './throughputMemory'

const manifest = {
  version: 1,
  timescale: 48_000,
  durationTicks: 2_880_000,
  durationMs: 60_000,
  renditions: [128, 192, 320].map((bitrate) => ({
    bitrate,
    codec: 'mp4a.40.2',
    size: 1_000,
    initRange: [0, 707] as [number, number],
    fragments: [],
  })),
} satisfies TrackManifest

describe('pickStartBitrate', () => {
  it('opens at the lowest rung when nothing is known about the connection', () => {
    expect(pickStartBitrate({ manifest, throughputBps: null })).toBe(128)
  })

  it('opens at the top rung on a connection that comfortably affords it', () => {
    expect(pickStartBitrate({ manifest, throughputBps: 50_000_000 })).toBe(320)
  })

  it('opens mid-ladder when bandwidth only affords the middle rung', () => {
    expect(pickStartBitrate({ manifest, throughputBps: 500_000 })).toBe(192)
  })

  it('never opens above what the remembered bandwidth supports', () => {
    expect(pickStartBitrate({ manifest, throughputBps: 300_000 })).toBe(128)
  })

  it('falls back to the lowest rung when even that is unaffordable', () => {
    expect(pickStartBitrate({ manifest, throughputBps: 1_000 })).toBe(128)
  })
})

describe('throughput memory', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null before anything has been measured', () => {
    expect(readRememberedThroughput()).toBeNull()
  })

  it('round-trips a measured estimate', () => {
    rememberThroughput({ bps: 12_000_000 })

    expect(readRememberedThroughput()).toBe(12_000_000)
  })

  it('ignores an estimate old enough to describe a different network', () => {
    const eightHoursAgo = Date.now() - 8 * 60 * 60 * 1000
    localStorage.setItem(
      'player-throughput',
      JSON.stringify({ bps: 12_000_000, savedAtMs: eightHoursAgo }),
    )

    expect(readRememberedThroughput()).toBeNull()
  })

  it('ignores a corrupted entry instead of throwing', () => {
    localStorage.setItem('player-throughput', 'not json')

    expect(readRememberedThroughput()).toBeNull()
  })
})
