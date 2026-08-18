import { beforeEach, describe, expect, it } from 'vitest'

import type { TrackManifest } from '@/entities/Player/model/manifest.types'
import { AdaptiveBitrateController } from './adaptiveBitrate'

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

/** Feeds samples until the EWMA settles near the target bandwidth. */
const settleAt = (abr: AdaptiveBitrateController, kbps: number) => {
  for (let i = 0; i < 20; i += 1) {
    abr.addSample({ bytes: (kbps * 1000) / 8, durationMs: 1_000 })
  }
}

describe('AdaptiveBitrateController', () => {
  let abr: AdaptiveBitrateController

  beforeEach(() => {
    abr = new AdaptiveBitrateController()
  })

  it('holds the current bitrate until it has measured anything', () => {
    expect(
      abr.decide({
        bufferedAhead: 30,
        currentBitrate: 320,
        manifest,
        nowMs: 0,
      }),
    ).toBe(320)
  })

  it('measures throughput in bits per second from real bytes and time', () => {
    abr.addSample({ bytes: 125_000, durationMs: 1_000 })

    expect(abr.estimatedBps).toBe(1_000_000)
  })

  it('ignores nonsensical samples', () => {
    abr.addSample({ bytes: 0, durationMs: 1_000 })
    abr.addSample({ bytes: 1_000, durationMs: 0 })

    expect(abr.estimatedBps).toBeNull()
  })

  it('drops immediately when bandwidth no longer covers the current rendition', () => {
    settleAt(abr, 200)

    expect(
      abr.decide({
        bufferedAhead: 30,
        currentBitrate: 320,
        manifest,
        nowMs: 1_000,
      }),
    ).toBe(128)
  })

  it('drops to the floor on a stall regardless of the estimate', () => {
    settleAt(abr, 5_000)

    expect(
      abr.decide({
        bufferedAhead: 30,
        currentBitrate: 320,
        hadStall: true,
        manifest,
        nowMs: 1_000,
      }),
    ).toBe(128)
  })

  it('stays on the lowest rendition when even it is unaffordable', () => {
    settleAt(abr, 20)

    expect(
      abr.decide({
        bufferedAhead: 5,
        currentBitrate: 128,
        manifest,
        nowMs: 1_000,
      }),
    ).toBe(128)
  })

  it('does not upgrade on a thin buffer even with plenty of bandwidth', () => {
    settleAt(abr, 5_000)

    expect(
      abr.decide({
        bufferedAhead: 4,
        currentBitrate: 128,
        manifest,
        nowMs: 1_000,
      }),
    ).toBe(128)
  })

  it('does not upgrade before throughput has been stable long enough', () => {
    settleAt(abr, 5_000)

    abr.decide({
      bufferedAhead: 30,
      currentBitrate: 128,
      manifest,
      nowMs: 1_000,
    })

    expect(
      abr.decide({
        bufferedAhead: 30,
        currentBitrate: 128,
        manifest,
        nowMs: 3_000,
      }),
    ).toBe(128)
  })

  it('upgrades one rung after sustained headroom', () => {
    settleAt(abr, 5_000)

    abr.decide({
      bufferedAhead: 30,
      currentBitrate: 128,
      manifest,
      nowMs: 10_000,
    })

    expect(
      abr.decide({
        bufferedAhead: 30,
        currentBitrate: 128,
        manifest,
        nowMs: 25_000,
      }),
    ).toBe(192)
  })

  it('leaves headroom rather than spending the whole measured bandwidth', () => {
    /** 320 kbps measured exactly: with a safety factor the 320 rung is not affordable. */
    settleAt(abr, 320)

    expect(
      abr.decide({
        bufferedAhead: 30,
        currentBitrate: 320,
        manifest,
        nowMs: 1_000,
      }),
    ).toBe(192)
  })

  it('honours a cooldown between consecutive switches', () => {
    settleAt(abr, 200)
    abr.decide({
      bufferedAhead: 30,
      currentBitrate: 320,
      manifest,
      nowMs: 1_000,
    })

    settleAt(abr, 5_000)
    abr.decide({
      bufferedAhead: 30,
      currentBitrate: 128,
      manifest,
      nowMs: 2_000,
    })

    expect(
      abr.decide({
        bufferedAhead: 30,
        currentBitrate: 128,
        manifest,
        nowMs: 4_000,
      }),
    ).toBe(128)
  })

  it('forgets its estimate on reset', () => {
    settleAt(abr, 5_000)
    abr.reset()

    expect(abr.estimatedBps).toBeNull()
  })
})
