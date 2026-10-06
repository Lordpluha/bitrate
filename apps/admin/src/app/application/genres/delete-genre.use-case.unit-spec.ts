import { TestBed } from '@angular/core/testing'
import {
  type CreateGenreInput,
  type Genre,
  GenreRepository,
  type ListGenresQuery,
  type UpdateGenreInput,
} from '@domain/genre'
import { ActionNotAllowedError, type Page } from '@domain/shared'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeleteGenreUseCase } from './delete-genre.use-case'

const remove = vi.fn<(id: string) => Promise<void>>()

class StubGenreRepository extends GenreRepository {
  override list(_query: ListGenresQuery): Promise<Page<Genre>> {
    throw new Error('not used')
  }

  override get(_id: string): Promise<Genre> {
    throw new Error('not used')
  }

  override create(_input: CreateGenreInput): Promise<Genre> {
    throw new Error('not used')
  }

  override update(_input: UpdateGenreInput): Promise<Genre> {
    throw new Error('not used')
  }

  override delete(id: string): Promise<void> {
    return remove(id)
  }
}

function genre(counts: Genre['counts']): Genre {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    slug: 'synthwave',
    name: 'Synthwave',
    description: null,
    color: null,
    counts,
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    updatedAt: new Date('2026-09-01T00:00:00.000Z'),
  }
}

function create(): DeleteGenreUseCase {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [{ provide: GenreRepository, useClass: StubGenreRepository }],
  })

  return TestBed.inject(DeleteGenreUseCase)
}

describe('DeleteGenreUseCase', () => {
  beforeEach(() => {
    remove.mockReset()
    remove.mockResolvedValue(undefined)
  })

  it('deletes an unreferenced genre', async () => {
    await create().execute(genre({ tracks: 0, albums: 0, artists: 0 }))

    expect(remove).toHaveBeenCalledWith('3f2504e0-4f89-41d3-9a0c-0305e82c3301')
  })

  it('refuses a referenced genre without calling the API', async () => {
    await expect(create().execute(genre({ tracks: 2, albums: 0, artists: 0 }))).rejects.toThrow(
      ActionNotAllowedError,
    )
    expect(remove).not.toHaveBeenCalled()
  })
})
