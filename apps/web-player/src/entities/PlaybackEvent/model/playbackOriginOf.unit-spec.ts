import { describe, expect, it } from 'vitest'
import { playbackOriginOf } from './playbackOriginOf'

const ID = '0199aee0-0000-7000-8000-000000000001'

describe('playbackOriginOf', () => {
  it.each([
    [`album:${ID}`, { source: 'ALBUM', sourceId: ID }],
    [`artist:${ID}`, { source: 'ARTIST', sourceId: ID }],
    [ID, { source: 'PLAYLIST', sourceId: ID }],
    ['liked-songs', { source: 'LIBRARY' }],
  ] as const)('reads %s', (currentPlaylistId, origin) => {
    expect(playbackOriginOf({ currentPlaylistId })).toEqual(origin)
  })

  it('reports a single track without a context as OTHER', () => {
    expect(playbackOriginOf({ currentPlaylistId: null })).toEqual({
      source: 'OTHER',
    })
  })

  it.each(['album:not-a-uuid', 'something-else', 'artist:'])(
    'never sends a malformed id (%s)',
    (currentPlaylistId) => {
      expect(playbackOriginOf({ currentPlaylistId })).toEqual({
        source: 'OTHER',
      })
    },
  )
})
