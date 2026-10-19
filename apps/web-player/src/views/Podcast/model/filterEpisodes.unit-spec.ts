import { describe, expect, it } from 'vitest'
import { filterEpisodes } from './filterEpisodes'

const episode = (
  id: string,
  title: string,
  releaseDate: string | null,
  description: string | null = null,
) => ({
  description,
  id,
  releaseDate,
  title,
})

const episodes = [
  episode('e1', 'Ep. 10 — The first album', '2026-08-01'),
  episode(
    'e3',
    'Ep. 12 — Mixing for headphones',
    '2026-10-01',
    'Why earbuds lie',
  ),
  episode('e2', 'Ep. 11 — The second album', '2026-09-01'),
  episode('e0', 'Bonus — Live set', null),
]

describe('filterEpisodes', () => {
  it('lists the newest episode first, undated ones last', () => {
    const ids = filterEpisodes({
      episodes,
      filter: 'newest',
      query: '',
      savedIds: new Set(),
    }).map((item) => item.id)

    expect(ids).toEqual(['e3', 'e2', 'e1', 'e0'])
  })

  it('keeps only saved episodes on the Saved filter', () => {
    const ids = filterEpisodes({
      episodes,
      filter: 'saved',
      query: '',
      savedIds: new Set(['e1', 'e0']),
    }).map((item) => item.id)

    expect(ids).toEqual(['e1', 'e0'])
  })

  it('matches the search in the title or the description, ignoring case', () => {
    expect(
      filterEpisodes({
        episodes,
        filter: 'newest',
        query: 'MIXING',
        savedIds: new Set(),
      }).map((item) => item.id),
    ).toEqual(['e3'])
    expect(
      filterEpisodes({
        episodes,
        filter: 'newest',
        query: 'earbuds',
        savedIds: new Set(),
      }).map((item) => item.id),
    ).toEqual(['e3'])
  })

  it('ignores surrounding spaces in the search', () => {
    expect(
      filterEpisodes({
        episodes,
        filter: 'newest',
        query: '  album ',
        savedIds: new Set(),
      }),
    ).toHaveLength(2)
  })
})
