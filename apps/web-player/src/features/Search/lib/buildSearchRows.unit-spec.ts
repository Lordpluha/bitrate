import { describe, expect, it } from 'vitest'

import type { BuildSearchRowsInput } from './buildSearchRows'
import { buildSearchRows, getAllTabRows } from './buildSearchRows'

const input: BuildSearchRowsInput = {
  albums: [
    { id: 'album-1', title: 'Album One', cover: null, artistId: 'a1', rank: 1 },
  ],
  artists: [
    {
      id: 'artist-1',
      username: 'Artist One',
      avatar: null,
      bio: null,
      rank: 1,
    },
  ],
  playlists: [
    {
      id: 'playlist-1',
      title: 'Playlist One',
      cover: null,
      userId: 'u1',
      isPublic: true,
      rank: 1,
    },
  ],
  tracks: [
    { id: 'track-1', title: 'Track One', cover: null, artistId: 'a1', rank: 1 },
  ],
  users: [
    {
      id: 'user-1',
      username: 'User One',
      avatar: null,
      description: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
}

describe('buildSearchRows', () => {
  it('groups every result type under its filter tab', () => {
    const groups = buildSearchRows(input)

    expect(Object.keys(groups).sort()).toEqual([
      'Albums',
      'Artists',
      'Playlists',
      'Profiles',
      'Songs',
    ])
  })

  it('links artists to their artist page and marks the avatar as circular', () => {
    const [artistRow] = buildSearchRows(input).Artists ?? []

    expect(artistRow).toMatchObject({
      circularImage: true,
      href: '/main/artist/artist-1',
      kind: 'Artist',
      title: 'Artist One',
    })
  })

  it('carries artistId on song rows so the subtitle can resolve a name', () => {
    const [songRow] = buildSearchRows(input).Songs ?? []

    expect(songRow?.artistId).toBe('a1')
  })

  it('puts artists first on the All tab', () => {
    const rows = getAllTabRows(buildSearchRows(input))

    expect(rows[0]?.kind).toBe('Artist')
    expect(rows).toHaveLength(5)
  })

  it('skips empty groups on the All tab', () => {
    const rows = getAllTabRows(
      buildSearchRows({ ...input, artists: [], users: [] }),
    )

    expect(rows.map((row) => row.kind)).toEqual(['Song', 'Album', 'Playlist'])
  })
})
