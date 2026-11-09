import { describe, expect, it } from 'vitest'
import { toTopResultCard } from './topResultCard'

const base = {
  artistId: null,
  image: null,
  ownerId: null,
  rank: 1,
  subtitle: null,
}

describe('toTopResultCard', () => {
  it('turns a song into a playable card linked to its artist', () => {
    const card = toTopResultCard({
      ...base,
      artistId: 'ar1',
      id: 't1',
      subtitle: 'Mira Sol',
      title: 'Night Signal',
      type: 'tracks',
    })

    expect(card).toMatchObject({
      href: '/main/artist/Mira%20Sol',
      kind: 'Song',
      playKind: 'track',
      round: false,
      subtitle: 'Mira Sol',
      title: 'Night Signal',
    })
  })

  it('links a song without an artist name to its artist by id', () => {
    const card = toTopResultCard({
      ...base,
      artistId: 'ar1',
      id: 't1',
      title: 'Night Signal',
      type: 'tracks',
    })

    expect(card.href).toBe('/main/artist/ar1')
  })

  it('shows an artist round and without a play button', () => {
    const card = toTopResultCard({
      ...base,
      id: 'ar1',
      title: 'Mira Sol',
      type: 'artists',
    })

    expect(card).toMatchObject({
      href: '/main/artist/Mira%20Sol',
      kind: 'Artist',
      playKind: undefined,
      round: true,
    })
  })

  it('links albums and playlists to their pages and lets them play', () => {
    expect(
      toTopResultCard({
        ...base,
        id: 'al1',
        title: 'Afterglow',
        type: 'albums',
      }),
    ).toMatchObject({
      href: '/main/album/al1',
      kind: 'Album',
      playKind: 'album',
    })
    expect(
      toTopResultCard({
        ...base,
        id: 'p1',
        title: 'Night Drive',
        type: 'playlists',
      }),
    ).toMatchObject({
      href: '/main/playlist/p1',
      kind: 'Playlist',
      playKind: 'playlist',
    })
  })
})
