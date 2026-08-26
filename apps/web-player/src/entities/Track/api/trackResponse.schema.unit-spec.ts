import { describe, expect, it } from 'vitest'
import { fallbackTrackCover } from '@/shared/constants'
import { trackResponseSchema } from './trackResponse.schema'

describe('trackResponseSchema', () => {
  it('accepts a track without a cover', () => {
    const result = trackResponseSchema.safeParse({
      artistId: 'artist-1',
      audioUrl: 'track.mp3',
      cover: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      deletedAt: null,
      discNumber: 1,
      duration: 120,
      explicit: false,
      id: 'track-1',
      isrc: null,
      language: null,
      lyrics: null,
      playCount: 0,
      popularity: 0,
      previewUrl: null,
      processingAttempts: 0,
      processingError: null,
      processingFinishedAt: null,
      processingStartedAt: null,
      processingStatus: 'READY',
      releaseDate: null,
      title: 'Untitled',
      trackNumber: null,
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.cover).toBe(fallbackTrackCover)
    }
  })
})
