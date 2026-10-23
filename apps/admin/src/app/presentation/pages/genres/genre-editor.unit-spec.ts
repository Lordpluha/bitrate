import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router'
import {
  CreateGenreUseCase,
  DeleteGenreUseCase,
  GetGenreUseCase,
  UpdateGenreUseCase,
} from '@application/genres'
import { SessionStore } from '@application/session'
import type { Permission } from '@domain/access'
import type { Genre } from '@domain/genre'
import { ResourceNotFoundError } from '@domain/shared'
import { provideTestTransloco } from '@testing/transloco'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GenreEditorPage } from './genre-editor'

const GENRE_ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'

function genre(overrides: Partial<Genre> = {}): Genre {
  return {
    id: GENRE_ID,
    slug: 'dream-pop',
    name: 'Dream pop',
    description: 'Hazy, reverb-soaked pop.',
    color: '#148a78',
    counts: { tracks: 0, albums: 0, artists: 0 },
    createdAt: new Date('2026-09-01T10:00:00.000Z'),
    updatedAt: new Date('2026-09-01T10:00:00.000Z'),
    ...overrides,
  }
}

const getGenre = vi.fn<(id: string) => Promise<Genre>>()
const createGenre = vi.fn<(input: unknown) => Promise<Genre>>()
const deleteGenre = vi.fn<(genre: Genre) => Promise<void>>()

function create(id: string | null, permissions: Permission[]): void {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [
      ...provideTestTransloco(),
      provideZonelessChangeDetection(),
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap(id ? { id } : {}) } },
      },
      { provide: GetGenreUseCase, useValue: { execute: getGenre } },
      { provide: CreateGenreUseCase, useValue: { execute: createGenre } },
      { provide: UpdateGenreUseCase, useValue: { execute: vi.fn() } },
      { provide: DeleteGenreUseCase, useValue: { execute: deleteGenre } },
    ],
  })
  TestBed.inject(SessionStore).set({
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3399',
    email: 'ops@bitrate.me',
    username: 'ops',
    roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
    roleName: 'CURATOR',
    permissions,
  })
}

async function render() {
  const fixture = TestBed.createComponent(GenreEditorPage)
  await fixture.whenStable()
  const host = fixture.nativeElement as HTMLElement
  const button = (root: ParentNode | null, text: string) =>
    Array.from(root?.querySelectorAll<HTMLButtonElement>('button') ?? []).find((candidate) =>
      candidate.textContent?.trim().includes(text),
    )
  const dialog = () => document.body.querySelector('[data-slot="dialog-content"]')
  return { fixture, host, button, dialog }
}

describe('GenreEditorPage', () => {
  beforeEach(() => {
    getGenre.mockReset()
    createGenre.mockReset()
    deleteGenre.mockReset().mockResolvedValue(undefined)
  })

  it('says what is wrong with a field, in words, once it is touched', async () => {
    create(null, ['genres:read', 'genres:write'])
    const { fixture, host, button } = await render()

    button(host, 'Create genre')?.click()
    await fixture.whenStable()

    expect(host.querySelector('#genre-name-error')?.textContent).toContain('Name is required')
    expect(createGenre).not.toHaveBeenCalled()
  })

  it('creates a genre and opens it', async () => {
    createGenre.mockResolvedValue(genre())
    create(null, ['genres:read', 'genres:write'])
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true)
    const { fixture, host, button } = await render()

    const name = host.querySelector<HTMLInputElement>('#genre-name')
    if (name) {
      name.value = 'Dream pop'
      name.dispatchEvent(new Event('input'))
    }
    button(host, 'Create genre')?.click()
    await fixture.whenStable()

    expect(createGenre).toHaveBeenCalledWith(expect.objectContaining({ name: 'Dream pop' }))
    expect(navigate).toHaveBeenCalledWith(['/genres', GENRE_ID])
  })

  it('deletes an unused genre only after the operator confirms', async () => {
    getGenre.mockResolvedValue(genre())
    create(GENRE_ID, ['genres:read', 'genres:write', 'genres:delete'])
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true)
    const { fixture, host, button, dialog } = await render()

    button(host, 'Delete')?.click()
    await fixture.whenStable()
    expect(dialog()?.textContent).toContain('Permanently delete “Dream pop”')
    expect(deleteGenre).not.toHaveBeenCalled()

    button(dialog(), 'Delete genre')?.click()
    await fixture.whenStable()

    expect(deleteGenre).toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith(['/genres'])
  })

  it('offers no delete for a genre still in use', async () => {
    getGenre.mockResolvedValue(genre({ counts: { tracks: 3, albums: 0, artists: 1 } }))
    create(GENRE_ID, ['genres:read', 'genres:write', 'genres:delete'])
    const { host, button } = await render()

    expect(button(host, 'Delete')).toBeUndefined()
    expect(host.textContent).toContain('3')
  })

  it('shows read-only access plainly, without a save button', async () => {
    getGenre.mockResolvedValue(genre())
    create(GENRE_ID, ['genres:read'])
    const { host, button } = await render()

    expect(button(host, 'Save changes')).toBeUndefined()
    expect(host.textContent).toContain('can view genres but not change them')
    expect(host.querySelector<HTMLInputElement>('#genre-name')?.disabled).toBe(true)
  })

  it('says the genre is gone when it no longer exists', async () => {
    getGenre.mockRejectedValue(new ResourceNotFoundError())
    create(GENRE_ID, ['genres:read'])
    const { host } = await render()

    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Genre not found')
  })
})
