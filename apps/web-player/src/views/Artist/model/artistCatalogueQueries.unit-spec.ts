import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('@shared/api/client', () => ({
  clientFetchClient: { GET: get },
  fetchWithAuthRefresh: vi.fn(),
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}))

import { getAllAlbumsByArtist } from '@entities/Album'
import { getAllFollowedArtists } from '@entities/Artist'
import { getAllLikedTracks, getAllTracksByArtist } from '@entities/Track'
import { getAllFollowedUsers } from '@entities/User'

const ok = new Response(null, { status: 200 })
const track = (id: string) => ({
  artistId: 'artist-1',
  audioUrl: `${id}.mp3`,
  cover: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
  discNumber: 1,
  duration: 120,
  durationTicks: null,
  explicit: false,
  fragmentTimescale: null,
  id,
  isrc: null,
  language: null,
  lyrics: null,
  playCount: 0,
  playbackVersion: 1,
  popularity: 0,
  previewUrl: null,
  processingAttempts: 0,
  processingError: null,
  processingFinishedAt: null,
  processingStartedAt: null,
  processingStatus: 'READY',
  releaseDate: null,
  title: id,
  trackNumber: null,
  updatedAt: '2026-01-01T00:00:00.000Z',
})

const album = (id: string) => ({
  artistId: 'artist-1',
  cover: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  description: null,
  id,
  releaseDate: null,
  title: id,
  updatedAt: '2026-01-01T00:00:00.000Z',
})

describe('artist-scoped catalogue queries', () => {
  beforeEach(() => {
    get.mockReset()
  })

  it('loads track pages beyond the first global catalogue page', async () => {
    get
      .mockResolvedValueOnce({
        data: { data: [track('track-1')], limit: 100, page: 1, total: 101 },
        response: ok,
      })
      .mockResolvedValueOnce({
        data: { data: [track('track-101')], limit: 100, page: 2, total: 101 },
        response: ok,
      })

    const result = await getAllTracksByArtist('artist-1')

    expect(result.map(({ id }) => id)).toEqual(['track-1', 'track-101'])
    expect(get).toHaveBeenNthCalledWith(
      2,
      '/api/v1/tracks',
      expect.objectContaining({
        params: { query: { artistId: 'artist-1', limit: 100, page: 2 } },
      }),
    )
  })

  it('loads every artist album page', async () => {
    get
      .mockResolvedValueOnce({
        data: { data: [album('album-1')], limit: 100, page: 1, total: 101 },
        response: ok,
      })
      .mockResolvedValueOnce({
        data: { data: [album('album-101')], limit: 100, page: 2, total: 101 },
        response: ok,
      })

    const result = await getAllAlbumsByArtist('artist-1')

    expect(result.map(({ id }) => id)).toEqual(['album-1', 'album-101'])
  })

  it('does not truncate liked tracks after the first hundred', async () => {
    get
      .mockResolvedValueOnce({
        data: { data: [track('liked-1')], limit: 100, page: 1, total: 101 },
        response: ok,
      })
      .mockResolvedValueOnce({
        data: { data: [track('liked-101')], limit: 100, page: 2, total: 101 },
        response: ok,
      })

    const result = await getAllLikedTracks()

    expect(result.map(({ id }) => id)).toEqual(['liked-1', 'liked-101'])
  })

  it('does not truncate followed artists or users', async () => {
    const artist = {
      avatar: null,
      backgroundImage: null,
      bio: null,
      id: 'artist-101',
      monthlyListeners: 0,
      username: 'Artist 101',
      verified: false,
    }
    get
      .mockResolvedValueOnce({
        data: { data: [], limit: 100, page: 1, total: 101 },
        response: ok,
      })
      .mockResolvedValueOnce({
        data: { data: [artist], limit: 100, page: 2, total: 101 },
        response: ok,
      })

    await expect(getAllFollowedArtists()).resolves.toEqual([artist])

    const user = {
      avatar: null,
      description: null,
      followedAt: '2026-01-01T00:00:00.000Z',
      id: 'user-101',
      username: 'User 101',
    }
    get
      .mockResolvedValueOnce({
        data: { data: [], limit: 100, page: 1, total: 101 },
        response: ok,
      })
      .mockResolvedValueOnce({
        data: { data: [user], limit: 100, page: 2, total: 101 },
        response: ok,
      })

    await expect(getAllFollowedUsers()).resolves.toEqual([user])
  })
})
