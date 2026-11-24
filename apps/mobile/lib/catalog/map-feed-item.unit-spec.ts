import { mapFeedItem } from './map-feed-item'

const item = {
  id: 'x1',
  title: 'Night Drive',
  cover: null,
  artistId: 'a1',
  artist: { id: 'a1', username: 'nova', avatar: null },
  user: { id: 'u1', username: 'curator', avatar: null },
}

describe('mapFeedItem', () => {
  it('treats new releases as albums', () => {
    expect(mapFeedItem('new-releases', item)).toMatchObject({ kind: 'album', subtitle: 'nova' })
  })

  it('treats popular playlists as playlists owned by a user', () => {
    expect(mapFeedItem('popular-playlists', item)).toMatchObject({ kind: 'playlist', subtitle: 'curator' })
  })

  it('treats every other section as playable tracks', () => {
    const card = mapFeedItem('made-for-you', item)
    expect(card.kind).toBe('track')
    if (card.kind !== 'track') return
    expect(card.track).toEqual({
      id: 'x1',
      title: 'Night Drive',
      artistName: 'nova',
      artistId: 'a1',
      coverUrl: null,
      durationSec: null,
    })
  })
})
