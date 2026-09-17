import { describe, expect, it } from 'vitest'
import {
  canReprocess,
  canRestoreTrack,
  canTakeDownTrack,
  isTrackStuck,
  STUCK_AFTER_MS,
  type Track,
  trackNeedsAttention,
} from './track'

const NOW = new Date('2026-09-14T12:00:00.000Z')

function track(overrides: Partial<Track> = {}): Track {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    title: 'Night Drive',
    artistUsername: 'dj-test',
    processingStatus: 'PROCESSING',
    processingError: null,
    processingAttempts: 0,
    processingStartedAt: NOW,
    processingFinishedAt: null,
    updatedAt: NOW,
    takenDownAt: null,
    createdAt: NOW,
    ...overrides,
  }
}

describe('isTrackStuck', () => {
  it('is false while the track is inside the window', () => {
    const started = new Date(NOW.getTime() - STUCK_AFTER_MS + 1000)

    expect(isTrackStuck({ track: track({ processingStartedAt: started }), now: NOW })).toBe(false)
  })

  it('is true once the track is past it', () => {
    const started = new Date(NOW.getTime() - STUCK_AFTER_MS - 1000)

    expect(isTrackStuck({ track: track({ processingStartedAt: started }), now: NOW })).toBe(true)
  })

  it('falls back to updatedAt for a track that never recorded a start, and is stuck once that is old', () => {
    const staleUpdate = new Date(NOW.getTime() - STUCK_AFTER_MS - 1000)
    const never = track({ processingStartedAt: null, updatedAt: staleUpdate })

    expect(isTrackStuck({ track: never, now: NOW })).toBe(true)
  })

  it('is false for a track with no start but a recent updatedAt', () => {
    const recentUpdate = new Date(NOW.getTime() - STUCK_AFTER_MS + 1000)
    const never = track({ processingStartedAt: null, updatedAt: recentUpdate })

    expect(isTrackStuck({ track: never, now: NOW })).toBe(false)
  })

  it('is false for a finished track, even one that took hours', () => {
    const slow = track({
      processingStatus: 'READY',
      processingStartedAt: new Date(NOW.getTime() - STUCK_AFTER_MS * 10),
    })

    expect(isTrackStuck({ track: slow, now: NOW })).toBe(false)
  })
})

describe('trackNeedsAttention', () => {
  it('flags a failed track regardless of timing', () => {
    const failed = track({ processingStatus: 'FAILED', processingStartedAt: NOW })

    expect(trackNeedsAttention({ track: failed, now: NOW })).toBe(true)
  })

  it('leaves a healthy in-flight track alone', () => {
    expect(trackNeedsAttention({ track: track(), now: NOW })).toBe(false)
  })
})

describe('canReprocess', () => {
  it('refuses a track that already finished', () => {
    expect(canReprocess(track({ processingStatus: 'READY' }))).toBe(false)
  })

  it('allows a failed or in-flight track', () => {
    expect(canReprocess(track({ processingStatus: 'FAILED' }))).toBe(true)
    expect(canReprocess(track({ processingStatus: 'PROCESSING' }))).toBe(true)
  })

  it('refuses a taken-down track even while still marked FAILED', () => {
    const takenDown = track({ processingStatus: 'FAILED', takenDownAt: NOW })

    expect(canReprocess(takenDown)).toBe(false)
  })
})

describe('canTakeDownTrack', () => {
  it('allows taking down a track that is not taken down', () => {
    expect(canTakeDownTrack(track()).allowed).toBe(true)
  })

  it('refuses a track that is already taken down', () => {
    const decision = canTakeDownTrack(track({ takenDownAt: NOW }))

    expect(decision).toEqual({
      allowed: false,
      reason: expect.stringContaining('already taken down'),
    })
  })
})

describe('canRestoreTrack', () => {
  it('allows restoring a taken-down track', () => {
    expect(canRestoreTrack(track({ takenDownAt: NOW })).allowed).toBe(true)
  })

  it('refuses a track that is not taken down', () => {
    const decision = canRestoreTrack(track())

    expect(decision).toEqual({ allowed: false, reason: expect.stringContaining('not taken down') })
  })
})
