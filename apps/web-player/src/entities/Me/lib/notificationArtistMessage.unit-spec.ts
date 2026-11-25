import { describe, expect, it } from 'vitest'
import { getNotificationArtistMessage } from './notificationArtistMessage'

describe('getNotificationArtistMessage', () => {
  it('reads the approved artist message and its AI marker', () => {
    expect(
      getNotificationArtistMessage({
        payload: {
          albumId: 'a1',
          artistMessage: 'Thank you for waiting!',
          artistMessageAiGenerated: true,
        },
      }),
    ).toEqual({ text: 'Thank you for waiting!', aiGenerated: true })
  })

  it('treats a message without the flag as the artist’s own', () => {
    expect(
      getNotificationArtistMessage({ payload: { artistMessage: 'Out now' } }),
    ).toEqual({ text: 'Out now', aiGenerated: false })
  })

  it.each([null, {}, { albumId: 'a1' }, { artistMessage: '' }])(
    'leaves a notification without a message unchanged: %j',
    (payload) => {
      expect(getNotificationArtistMessage({ payload })).toBeNull()
    },
  )
})
