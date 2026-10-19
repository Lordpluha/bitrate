import { describe, expect, it } from 'vitest'
import { getFriendRelation, getPresenceLabel } from './friendStatus'

const now = new Date('2026-10-19T12:00:00.000Z')
const minutesAgo = (minutes: number) =>
  new Date(now.getTime() - minutes * 60_000)

describe('getPresenceLabel', () => {
  it('names the track a listening friend is playing', () => {
    expect(
      getPresenceLabel({
        now,
        presence: {
          lastActiveAt: now,
          nowPlaying: {
            artist: { id: 'a1', username: 'Luma Vale' },
            cover: null,
            id: 't1',
            title: 'Afterglow',
          },
          status: 'online',
        },
      }),
    ).toBe('Listening to Afterglow · Luma Vale')
  })

  it('says online, away for how long, or when they were last seen', () => {
    const label = (
      status: 'away' | 'offline' | 'online',
      lastActiveAt: Date | null,
    ) =>
      getPresenceLabel({
        now,
        presence: { lastActiveAt, nowPlaying: null, status },
      })

    expect(label('online', minutesAgo(1))).toBe('Online')
    expect(label('away', minutesAgo(12))).toBe('Away · 12 min')
    expect(label('offline', minutesAgo(120))).toBe('Last seen 2 hr. ago')
    expect(label('offline', null)).toBe('Offline')
  })
})

describe('getFriendRelation', () => {
  const lists = {
    friendIds: new Set(['u-friend']),
    incoming: [{ id: 'r-in', user: { id: 'u-in' } }],
    outgoing: [{ id: 'r-out', user: { id: 'u-out' } }],
  }

  it('tells friends, sent requests, incoming requests and strangers apart', () => {
    expect(getFriendRelation({ ...lists, userId: 'u-friend' })).toEqual({
      kind: 'friends',
    })
    expect(getFriendRelation({ ...lists, userId: 'u-out' })).toEqual({
      kind: 'outgoing',
      requestId: 'r-out',
    })
    expect(getFriendRelation({ ...lists, userId: 'u-in' })).toEqual({
      kind: 'incoming',
      requestId: 'r-in',
    })
    expect(getFriendRelation({ ...lists, userId: 'u-new' })).toEqual({
      kind: 'none',
    })
  })
})
