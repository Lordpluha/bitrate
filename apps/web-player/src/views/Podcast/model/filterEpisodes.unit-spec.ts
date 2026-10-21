import { describe, expect, it } from 'vitest'
import { filterSavedEpisodes } from './filterEpisodes'

const episode = (
  id: string,
  title: string,
  releaseDate: string | null,
  description: string | null = null,
  podcastId = 'show',
) => ({
  description,
  id,
  podcastId,
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
  episode('x1', 'Another show’s album', '2026-11-01', null, 'other-show'),
]

describe('filterSavedEpisodes', () => {
  it('keeps only this show’s episodes, the newest first and undated ones last', () => {
    const ids = filterSavedEpisodes({
      episodes,
      podcastId: 'show',
      query: '',
    }).map((item) => item.id)

    expect(ids).toEqual(['e3', 'e2', 'e1', 'e0'])
  })

  it('matches the search in the title or the description, ignoring case', () => {
    expect(
      filterSavedEpisodes({
        episodes,
        podcastId: 'show',
        query: 'MIXING',
      }).map((item) => item.id),
    ).toEqual(['e3'])
    expect(
      filterSavedEpisodes({
        episodes,
        podcastId: 'show',
        query: 'earbuds',
      }).map((item) => item.id),
    ).toEqual(['e3'])
  })

  it('ignores surrounding spaces in the search', () => {
    expect(
      filterSavedEpisodes({
        episodes,
        podcastId: 'show',
        query: '  album ',
      }),
    ).toHaveLength(2)
  })
})
