import { describe, expect, it } from 'vitest'
import { chunkTrackIds, TRACK_ALBUMS_BATCH } from './trackAlbums'

describe('chunkTrackIds', () => {
  it('splits a long list into batches the API accepts, keeping order and dropping repeats', () => {
    const ids = Array.from(
      { length: TRACK_ALBUMS_BATCH + 5 },
      (_, index) => `t${index}`,
    )

    const batches = chunkTrackIds([...ids, 't0'])

    expect(batches.map((batch) => batch.length)).toEqual([
      TRACK_ALBUMS_BATCH,
      5,
    ])
    expect(batches.flat()).toEqual(ids)
  })

  it('has nothing to ask for an empty list', () => {
    expect(chunkTrackIds([])).toEqual([])
  })
})
