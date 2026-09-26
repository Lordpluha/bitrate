import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Page } from '@domain/shared'
import { type ArtistAlbum, ArtistRepository } from '@domain/artist'
import { ListArtistAlbumsUseCase } from './list-artist-albums.use-case'

const listAlbums = vi.fn<(artistId: string, page: number) => Promise<Page<ArtistAlbum>>>()

class StubArtistRepository extends ArtistRepository {
  override list(): Promise<never> {
    throw new Error('not used by this use case')
  }

  override getById(): Promise<never> {
    throw new Error('not used by this use case')
  }

  override setVerification(): Promise<never> {
    throw new Error('not used by this use case')
  }

  override deactivate(): Promise<void> {
    throw new Error('not used by this use case')
  }

  override restore(): Promise<void> {
    throw new Error('not used by this use case')
  }

  override revokeSessions(): Promise<number> {
    throw new Error('not used by this use case')
  }

  override listTracks(): Promise<never> {
    throw new Error('not used by this use case')
  }

  override listAlbums(artistId: string, page: number): Promise<Page<ArtistAlbum>> {
    return listAlbums(artistId, page)
  }
}

function page(): Page<ArtistAlbum> {
  return {
    items: [
      {
        id: 'a1b2c3d4-4f89-41d3-9a0c-0305e82c3301',
        title: 'Test Album',
        coverUrl: null,
        type: 'ALBUM',
        totalTracks: 8,
        releaseDate: null,
        takenDownAt: null,
        createdAt: new Date('2026-09-01T00:00:00.000Z'),
      },
    ],
    total: 1,
    page: 1,
    limit: 10,
  }
}

function create(): ListArtistAlbumsUseCase {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [{ provide: ArtistRepository, useClass: StubArtistRepository }],
  })

  return TestBed.inject(ListArtistAlbumsUseCase)
}

describe('ListArtistAlbumsUseCase', () => {
  beforeEach(() => {
    listAlbums.mockReset()
  })

  it('passes the artist id and page through to the repository', async () => {
    const result = page()
    listAlbums.mockResolvedValue(result)

    const response = await create().execute({
      artistId: 'a1b2c3d4-4f89-41d3-9a0c-0305e82c3301',
      page: 2,
    })

    expect(listAlbums).toHaveBeenCalledWith('a1b2c3d4-4f89-41d3-9a0c-0305e82c3301', 2)
    expect(response).toBe(result)
  })

  it('propagates a repository rejection instead of swallowing it', async () => {
    listAlbums.mockRejectedValue(new Error('network down'))

    await expect(create().execute({ artistId: 'id', page: 1 })).rejects.toThrow('network down')
  })
})
