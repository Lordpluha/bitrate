import { describe, expect, it } from 'vitest'
import { buildHeaderSuggestions } from './buildHeaderSuggestions'

const labels = {
  album: 'Album',
  genre: 'Genre',
  playlist: 'Playlist',
  search: 'Search',
  song: 'Song',
  unknown: 'Unknown',
}
const base = {
  categories: [],
  history: [],
  labels,
  query: 'night',
  results: undefined,
}

describe('buildHeaderSuggestions', () => {
  it('suggests only the typed query when nothing else matches', () => {
    expect(buildHeaderSuggestions(base)).toEqual([
      { query: 'night', subtitle: 'Search', title: 'night', type: 'query' },
    ])
  })

  it('never invents query variations', () => {
    const titles = buildHeaderSuggestions(base).map((s) => s.title)
    expect(titles.some((t) => /playlist|motivation|2026/.test(t))).toBe(false)
  })

  it('adds the user past searches that contain the query, without repeating it', () => {
    const titles = buildHeaderSuggestions({
      ...base,
      history: [
        'night drive',
        'Night',
        'morning',
        'late night jazz',
        'night owls',
        'night shift',
      ],
    }).map((s) => s.title)

    expect(titles).toEqual([
      'night',
      'night drive',
      'late night jazz',
      'night owls',
    ])
  })

  it('suggests real browse categories by name with their slug link', () => {
    const [, category] = buildHeaderSuggestions({
      ...base,
      query: 'house',
      categories: [
        { name: 'House', slug: 'house', cover: '/c.jpg' },
        { name: 'Jazz', slug: 'jazz', cover: null },
      ],
    })

    expect(category).toMatchObject({
      href: '/main/search?category=house',
      subtitle: 'Genre',
      title: 'House',
      type: 'media',
    })
  })

  it('shows songs with their artist name and links to the artist', () => {
    const suggestions = buildHeaderSuggestions({
      ...base,
      results: {
        albums: [],
        playlists: [],
        tracks: [
          {
            id: 't1',
            title: 'Night Signal',
            cover: null,
            artistId: 'a1',
            artistName: 'Mira Sol',
            rank: 1,
          },
          {
            id: 't2',
            title: 'Nightfall',
            cover: null,
            artistId: '',
            artistName: null,
            rank: 1,
          },
        ],
      },
    })

    expect(suggestions[1]).toMatchObject({
      title: 'Night Signal',
      subtitle: 'Song • Mira Sol',
      href: '/main/artist/a1',
    })
    expect(suggestions[2]).toMatchObject({
      title: 'Nightfall',
      subtitle: 'Song • Unknown',
    })
    expect(suggestions[2]?.href).toBeUndefined()
  })

  it('caps the list at nine', () => {
    const track = (i: number) => ({
      id: `t${i}`,
      title: `Night ${i}`,
      cover: null,
      artistId: 'a1',
      artistName: 'A',
      rank: 1,
    })
    const playlist = (i: number) => ({
      id: `p${i}`,
      title: `P ${i}`,
      cover: null,
      isPublic: true,
      rank: 1,
      userId: 'u',
    })
    const album = (i: number) => ({
      id: `al${i}`,
      title: `Al ${i}`,
      cover: null,
      artistId: 'a1',
      rank: 1,
    })
    const all = buildHeaderSuggestions({
      ...base,
      history: ['night 1', 'night 2', 'night 3'],
      results: {
        tracks: [0, 1, 2].map(track),
        playlists: [0, 1, 2].map(playlist),
        albums: [0, 1].map(album),
      },
    })
    expect(all).toHaveLength(9)
  })
})
