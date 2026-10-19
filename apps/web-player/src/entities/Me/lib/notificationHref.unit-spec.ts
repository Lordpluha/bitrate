import { describe, expect, it } from 'vitest'
import { getNotificationHref } from './notificationHref'

describe('getNotificationHref', () => {
  it('opens the profile of the person who followed', () => {
    expect(
      getNotificationHref({
        payload: { actorId: 'u1', actorUsername: 'ann' },
        type: 'FOLLOW',
      }),
    ).toBe('/main/user/u1')
  })

  it('opens the artist of a new release', () => {
    expect(
      getNotificationHref({
        payload: {
          artistId: 'a1',
          artistName: 'Band',
          trackId: 't1',
          trackTitle: 'Song',
        },
        type: 'NEW_RELEASE',
      }),
    ).toBe('/main/artist/a1')
  })

  it('opens the friend requests for a request, and the friends for an acceptance', () => {
    const payload = { actorId: 'u1', actorUsername: 'ann', requestId: 'r1' }
    expect(getNotificationHref({ payload, type: 'FRIEND_REQUEST' })).toBe(
      '/main/friends/requests',
    )
    expect(getNotificationHref({ payload, type: 'FRIEND_ACCEPTED' })).toBe(
      '/main/friends',
    )
  })

  it('has no target for a malformed payload or a type without one', () => {
    expect(getNotificationHref({ payload: null, type: 'FOLLOW' })).toBeNull()
    expect(
      getNotificationHref({ payload: { trackId: 't1' }, type: 'NEW_RELEASE' }),
    ).toBeNull()
    expect(getNotificationHref({ payload: {}, type: 'SYSTEM' })).toBeNull()
  })
})
