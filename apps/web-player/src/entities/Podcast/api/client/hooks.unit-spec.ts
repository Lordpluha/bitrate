import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('@shared/api/client', () => ({
  clientFetchClient: { GET: get },
}))

import { getAllSavedEpisodes } from '@/entities/Podcast/api/client/hooks'

const ok = new Response(null, { status: 200 })
const podcast = {
  cover: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  description: null,
  explicit: false,
  id: 'podcast-1',
  language: null,
  publisher: 'Publisher',
  title: 'Show',
  updatedAt: '2026-01-01T00:00:00.000Z',
}
const savedEpisode = (id: string) => ({
  audioUrl: `${id}.mp3`,
  cover: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  description: null,
  duration: null,
  explicit: false,
  id,
  podcast,
  podcastId: podcast.id,
  releaseDate: null,
  savedAt: '2026-02-01T00:00:00.000Z',
  title: id,
  updatedAt: '2026-01-01T00:00:00.000Z',
})
const page = (pageNumber: number, ids: string[]) => ({
  data: {
    data: ids.map(savedEpisode),
    limit: 100,
    page: pageNumber,
    total: 201,
  },
  response: ok,
})

describe('getAllSavedEpisodes', () => {
  beforeEach(() => get.mockReset())

  it('requests every remaining page before any of them answers', async () => {
    let releasePageTwo = () => {}
    get
      .mockResolvedValueOnce(page(1, ['e1']))
      .mockReturnValueOnce(
        new Promise((resolve) => {
          releasePageTwo = () => resolve(page(2, ['e2']))
        }),
      )
      .mockResolvedValueOnce(page(3, ['e3']))

    const episodes = getAllSavedEpisodes()
    await vi.waitFor(() => expect(get).toHaveBeenCalledTimes(3))
    releasePageTwo()

    expect((await episodes).map(({ id }) => id)).toEqual(['e1', 'e2', 'e3'])
  })

  it('keeps one entry per episode when pages shift underneath', async () => {
    get
      .mockResolvedValueOnce(page(1, ['e1', 'e2']))
      .mockResolvedValueOnce(page(2, ['e2']))
      .mockResolvedValueOnce(page(3, []))

    expect((await getAllSavedEpisodes()).map(({ id }) => id)).toEqual([
      'e1',
      'e2',
    ])
  })
})
