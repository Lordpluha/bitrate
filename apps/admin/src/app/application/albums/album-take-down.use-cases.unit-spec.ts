import { TestBed } from '@angular/core/testing'
import { type Album, type AlbumDetail, AlbumRepository, type ListAlbumsQuery } from '@domain/album'
import { ActionNotAllowedError, type Page, type TakeDownInput } from '@domain/shared'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RestoreAlbumUseCase } from './restore-album.use-case'
import { TakeDownAlbumUseCase } from './take-down-album.use-case'

const takeDown = vi.fn<(input: TakeDownInput) => Promise<void>>()
const restore = vi.fn<(input: TakeDownInput) => Promise<void>>()

class StubAlbumRepository extends AlbumRepository {
  override list(_query: ListAlbumsQuery): Promise<Page<Album>> {
    throw new Error('not used')
  }

  override getById(_id: string): Promise<AlbumDetail> {
    throw new Error('not used')
  }

  override takeDown(input: TakeDownInput): Promise<void> {
    return takeDown(input)
  }

  override restore(input: TakeDownInput): Promise<void> {
    return restore(input)
  }
}

function album(overrides: Partial<Album> = {}): Album {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    title: 'Night Signal',
    artistId: '9f2504e0-4f89-41d3-9a0c-0305e82c3302',
    artistUsername: 'dj-test',
    coverUrl: null,
    type: 'ALBUM',
    totalTracks: 2,
    releaseDate: null,
    takenDownAt: null,
    createdAt: new Date('2026-09-01T09:59:00.000Z'),
    updatedAt: new Date('2026-09-01T09:59:00.000Z'),
    ...overrides,
  }
}

describe('album take-down use cases', () => {
  beforeEach(() => {
    takeDown.mockReset()
    takeDown.mockResolvedValue(undefined)
    restore.mockReset()
    restore.mockResolvedValue(undefined)
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [{ provide: AlbumRepository, useClass: StubAlbumRepository }],
    })
  })

  it('takes down an active album, forwarding the reason', async () => {
    await TestBed.inject(TakeDownAlbumUseCase).execute({
      album: album(),
      reason: 'rights claim',
    })

    expect(takeDown).toHaveBeenCalledWith({
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
      reason: 'rights claim',
    })
  })

  it('refuses to take down an album already taken down, without calling the API', async () => {
    const already = album({ takenDownAt: new Date('2026-09-10T08:00:00.000Z') })

    await expect(TestBed.inject(TakeDownAlbumUseCase).execute({ album: already })).rejects.toThrow(
      ActionNotAllowedError,
    )
    expect(takeDown).not.toHaveBeenCalled()
  })

  it('restores a taken-down album', async () => {
    await TestBed.inject(RestoreAlbumUseCase).execute({
      album: album({ takenDownAt: new Date('2026-09-10T08:00:00.000Z') }),
      reason: 'appeal upheld',
    })

    expect(restore).toHaveBeenCalledWith({
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
      reason: 'appeal upheld',
    })
  })

  it('refuses to restore an album that is not taken down, without calling the API', async () => {
    await expect(TestBed.inject(RestoreAlbumUseCase).execute({ album: album() })).rejects.toThrow(
      ActionNotAllowedError,
    )
    expect(restore).not.toHaveBeenCalled()
  })
})
