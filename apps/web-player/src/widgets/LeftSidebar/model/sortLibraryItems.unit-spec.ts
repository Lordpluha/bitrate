import { describe, expect, it } from 'vitest'
import type { LibraryMusicItem } from './library.types'
import { sortLibraryItems } from './sortLibraryItems'

const item = (
  id: string,
  { createdAt, title = id, username = 'me' }: Partial<LibraryMusicItem> = {},
): LibraryMusicItem => ({
  cover: '/c.jpg',
  createdAt,
  id,
  title,
  tracksCount: 0,
  type: 'playlist',
  username,
})

const ids = (items: LibraryMusicItem[]) => items.map(({ id }) => id)

describe('sortLibraryItems', () => {
  const items = [
    item('liked-songs', { title: 'Liked Songs' }),
    item('b', {
      createdAt: '2026-10-01T00:00:00.000Z',
      title: 'Beta',
      username: 'zed',
    }),
    item('a', {
      createdAt: '2026-10-10T00:00:00.000Z',
      title: 'alpha',
      username: 'amy',
    }),
    item('c', { title: 'Gamma', username: 'amy' }),
  ]

  it('keeps Liked Songs first and lists the newest additions next', () => {
    expect(ids(sortLibraryItems({ items, sort: 'recent' }))).toEqual([
      'liked-songs',
      'a',
      'b',
      'c',
    ])
  })

  it('sorts by title ignoring case', () => {
    expect(ids(sortLibraryItems({ items, sort: 'title' }))).toEqual([
      'liked-songs',
      'a',
      'b',
      'c',
    ])
  })

  it('groups by creator, then title', () => {
    expect(ids(sortLibraryItems({ items, sort: 'creator' }))).toEqual([
      'liked-songs',
      'a',
      'c',
      'b',
    ])
  })
})
