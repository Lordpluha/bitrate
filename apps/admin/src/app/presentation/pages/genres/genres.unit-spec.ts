import { provideLocationMocks } from '@angular/common/testing'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, type Routes } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { SessionStore } from '@application/session'
import {
  type CreateGenreInput,
  type Genre,
  GenreRepository,
  type ListGenresQuery,
  type UpdateGenreInput,
} from '@domain/genre'
import type { Page } from '@domain/shared'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GenresPage } from './genres'

function genre(overrides: Partial<Genre> = {}): Genre {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    slug: 'synthwave',
    name: 'Synthwave',
    description: null,
    color: '#ff00aa',
    counts: { tracks: 0, albums: 0, artists: 0 },
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    updatedAt: new Date('2026-09-01T00:00:00.000Z'),
    ...overrides,
  }
}

const list = vi.fn<(query: ListGenresQuery) => Promise<Page<Genre>>>()
const remove = vi.fn<(id: string) => Promise<void>>()

class StubGenreRepository extends GenreRepository {
  override list(query: ListGenresQuery): Promise<Page<Genre>> {
    return list(query)
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

const routes: Routes = [{ path: 'genres', component: GenresPage }]

describe('GenresPage', () => {
  let harness: RouterTestingHarness

  beforeEach(async () => {
    list.mockReset()
    remove.mockReset()
    remove.mockResolvedValue(undefined)
    list.mockResolvedValue({
      items: [
        genre(),
        genre({
          id: '9f2504e0-4f89-41d3-9a0c-0305e82c3302',
          slug: 'pop',
          name: 'Pop',
          counts: { tracks: 4, albums: 1, artists: 0 },
        }),
      ],
      total: 2,
      page: 1,
      limit: 20,
    })

    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideLocationMocks(),
        { provide: GenreRepository, useClass: StubGenreRepository },
      ],
    })
    TestBed.inject(SessionStore).set({
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
      email: 'ops@bitrate.me',
      username: 'ops',
      roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
      roleName: 'ADMIN',
      permissions: [],
    })
    harness = await RouterTestingHarness.create()
  })

  it('offers delete only for an unreferenced genre and explains why for the others', async () => {
    await harness.navigateByUrl('/genres', GenresPage)
    await harness.fixture.whenStable()

    const rows = harness.routeNativeElement?.querySelectorAll('tbody tr') ?? []
    expect(rows).toHaveLength(2)
    expect(rows[0]?.textContent).toContain('Delete')
    expect(rows[1]?.textContent).not.toContain('Delete')
    expect(rows[1]?.textContent).toContain('Still referenced by 4 tracks')
  })

  it('does not delete until the dialog is confirmed', async () => {
    await harness.navigateByUrl('/genres', GenresPage)
    await harness.fixture.whenStable()

    const button = [
      ...(harness.routeNativeElement?.querySelectorAll<HTMLButtonElement>('tbody button') ?? []),
    ].find((candidate) => candidate.textContent?.includes('Delete'))
    button?.click()
    await harness.fixture.whenStable()

    expect(remove).not.toHaveBeenCalled()
    expect(document.body.textContent).toContain('Permanently delete "Synthwave"')

    const confirm = [...document.body.querySelectorAll<HTMLButtonElement>('button')].find(
      (candidate) => candidate.textContent?.includes('Delete genre'),
    )
    confirm?.click()
    await harness.fixture.whenStable()

    expect(remove).toHaveBeenCalledWith('3f2504e0-4f89-41d3-9a0c-0305e82c3301')
  })
})
