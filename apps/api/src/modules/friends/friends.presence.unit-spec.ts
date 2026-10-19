import { describe, expect, it } from '@jest/globals'
import { derivePresence } from './friends.presence'

const now = new Date('2026-10-19T12:00:00.000Z')
const minutesAgo = (minutes: number) => new Date(now.getTime() - minutes * 60_000)
const track = { id: 't1', title: 'Afterglow' }

describe('derivePresence', () => {
  it('is online and listening while a shared track plays', () => {
    expect(
      derivePresence({
        deviceSeenAt: null,
        now,
        player: { isPlaying: true, track, updatedAt: minutesAgo(0.5) },
        sharesListening: true,
      }),
    ).toEqual({ lastActiveAt: minutesAgo(0.5), nowPlaying: track, status: 'online' })
  })

  it('keeps the track private when the friend does not share listening', () => {
    expect(
      derivePresence({
        deviceSeenAt: null,
        now,
        player: { isPlaying: true, track, updatedAt: minutesAgo(1) },
        sharesListening: false,
      }),
    ).toEqual({ lastActiveAt: minutesAgo(1), nowPlaying: null, status: 'online' })
  })

  it('does not report a stale playing state as listening', () => {
    expect(
      derivePresence({
        deviceSeenAt: null,
        now,
        player: { isPlaying: true, track, updatedAt: minutesAgo(10) },
        sharesListening: true,
      }),
    ).toEqual({ lastActiveAt: minutesAgo(10), nowPlaying: null, status: 'away' })
  })

  it('takes the latest of the player and the device activity', () => {
    expect(
      derivePresence({
        deviceSeenAt: minutesAgo(1),
        now,
        player: { isPlaying: false, track, updatedAt: minutesAgo(40) },
        sharesListening: true,
      }),
    ).toEqual({ lastActiveAt: minutesAgo(1), nowPlaying: null, status: 'online' })
  })

  it('is offline after 15 minutes, and without any activity at all', () => {
    expect(
      derivePresence({
        deviceSeenAt: minutesAgo(16),
        now,
        player: null,
        sharesListening: true,
      }),
    ).toEqual({ lastActiveAt: minutesAgo(16), nowPlaying: null, status: 'offline' })
    expect(
      derivePresence({ deviceSeenAt: null, now, player: null, sharesListening: true }),
    ).toEqual({ lastActiveAt: null, nowPlaying: null, status: 'offline' })
  })
})
