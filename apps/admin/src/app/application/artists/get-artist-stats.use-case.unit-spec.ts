import { TestBed } from '@angular/core/testing'
import { describe, expect, it, vi } from 'vitest'
import {
  type Artist,
  type ArtistAlbum,
  type ArtistDetail,
  ArtistRepository,
  type ArtistTrack,
  type ListArtistsQuery,
} from '@domain/artist'
import type { Page } from '@domain/shared'
import { GetArtistStatsUseCase } from './get-artist-stats.use-case'

const list = vi.fn<(query: ListArtistsQuery) => Promise<Page<Artist>>>()

class StubArtistRepository extends ArtistRepository {
  override list(query: ListArtistsQuery): Promise<Page<Artist>> {
    return list(query)
  }

  override getById(): Promise<ArtistDetail> {
    throw new Error('not used')
  }

  override setVerification(): Promise<Artist> {
    throw new Error('not used')
  }

  override deactivate(): Promise<void> {
    throw new Error('not used')
  }

  override restore(): Promise<void> {
    throw new Error('not used')
  }

  override revokeSessions(): Promise<number> {
    throw new Error('not used')
  }

  override listTracks(): Promise<Page<ArtistTrack>> {
    throw new Error('not used')
  }

  override listAlbums(): Promise<Page<ArtistAlbum>> {
    throw new Error('not used')
  }
}

function create(): GetArtistStatsUseCase {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [{ provide: ArtistRepository, useClass: StubArtistRepository }],
  })
  return TestBed.inject(GetArtistStatsUseCase)
}

describe('GetArtistStatsUseCase', () => {
  it('counts active artists, how many are verified or waiting, and the deactivated', async () => {
    list.mockReset().mockImplementation(({ filter }) => {
      const total =
        filter.status === 'deactivated'
          ? 12
          : filter.verified === true
            ? 1904
            : filter.verified === false
              ? 38
              : 2316
      return Promise.resolve({ items: [], total, page: 1, limit: 1 })
    })

    expect(await create().execute()).toEqual({
      live: 2316,
      takenDown: 12,
      verified: 1904,
      unverified: 38,
    })
    expect(list).toHaveBeenCalledWith({
      page: 1,
      limit: 1,
      filter: { status: 'active', verified: false },
    })
  })

  it('fails when any count fails', async () => {
    list
      .mockReset()
      .mockImplementation(({ filter }) =>
        filter.verified === true
          ? Promise.reject(new Error('down'))
          : Promise.resolve({ items: [], total: 1, page: 1, limit: 1 }),
      )

    await expect(create().execute()).rejects.toThrow('down')
  })
})
