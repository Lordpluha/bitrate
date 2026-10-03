import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { GenreRepository, GenreWriteError } from '@domain/genre'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ADMIN_API } from '../http/api.config'
import { HttpGenreRepository } from './http-genre.repository'

const BASE = `${ADMIN_API}/genres`

const GENRE_RESPONSE = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  slug: 'synthwave',
  name: 'Synthwave',
  description: null,
  color: '#ff00aa',
  counts: { tracks: 3, albums: 0, artists: 1 },
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-02T00:00:00.000Z',
}

describe('HttpGenreRepository', () => {
  let repository: GenreRepository
  let http: HttpTestingController

  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: GenreRepository, useClass: HttpGenreRepository },
      ],
    })

    repository = TestBed.inject(GenreRepository)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  it('lists a page, sending search and sort, and maps the rows', async () => {
    const page = repository.list({
      page: 2,
      limit: 20,
      filter: { query: 'syn', sort: { field: 'name', direction: 'desc' } },
    })

    const request = http.expectOne((candidate) => candidate.url === BASE)
    expect(request.request.params.get('q')).toBe('syn')
    expect(request.request.params.get('sort')).toBe('name')
    expect(request.request.params.get('order')).toBe('desc')
    request.flush({ data: [GENRE_RESPONSE], total: 1, page: 2, limit: 20 })

    const result = await page
    expect(result.items[0]).toMatchObject({
      slug: 'synthwave',
      counts: { tracks: 3, albums: 0, artists: 1 },
      createdAt: new Date('2026-09-01T00:00:00.000Z'),
    })
  })

  it('creates a genre, omitting an unset slug so the API derives it', async () => {
    const created = repository.create({ name: 'Synthwave', color: '#ff00aa' })

    const request = http.expectOne(BASE)
    expect(request.request.body).toEqual({ name: 'Synthwave', color: '#ff00aa' })
    request.flush(GENRE_RESPONSE)

    await expect(created).resolves.toMatchObject({ name: 'Synthwave' })
  })

  it('refuses a malformed colour before it reaches the network', async () => {
    await expect(repository.create({ name: 'X', color: 'red' })).rejects.toBeInstanceOf(
      GenreWriteError,
    )
    http.expectNone(BASE)
  })

  it('maps a 409 on create to slug-taken', async () => {
    const created = repository.create({ name: 'Pop', slug: 'pop' })

    http.expectOne(BASE).flush(null, { status: 409, statusText: 'Conflict' })

    const error = await created.catch((caught: unknown) => caught)
    expect(error).toBeInstanceOf(GenreWriteError)
    expect((error as GenreWriteError).reason).toBe('slug-taken')
  })

  it('maps a 409 on update to slug-taken', async () => {
    const updated = repository.update({ id: GENRE_RESPONSE.id, slug: 'pop' })

    http
      .expectOne(`${BASE}/${GENRE_RESPONSE.id}`)
      .flush(null, { status: 409, statusText: 'Conflict' })

    const error = await updated.catch((caught: unknown) => caught)
    expect((error as GenreWriteError).reason).toBe('slug-taken')
  })

  it('maps a 409 on delete to in-use and carries the reference counts', async () => {
    const removed = repository.delete(GENRE_RESPONSE.id)

    http
      .expectOne(`${BASE}/${GENRE_RESPONSE.id}`)
      .flush(
        { counts: { tracks: 4, albums: 1, artists: 0 } },
        { status: 409, statusText: 'Conflict' },
      )

    const error = await removed.catch((caught: unknown) => caught)
    expect(error).toBeInstanceOf(GenreWriteError)
    expect((error as GenreWriteError).reason).toBe('in-use')
    expect((error as GenreWriteError).counts).toEqual({ tracks: 4, albums: 1, artists: 0 })
  })

  it('maps a 404 to not-found', async () => {
    const removed = repository.delete(GENRE_RESPONSE.id)

    http
      .expectOne(`${BASE}/${GENRE_RESPONSE.id}`)
      .flush(null, { status: 404, statusText: 'Not Found' })

    const error = await removed.catch((caught: unknown) => caught)
    expect((error as GenreWriteError).reason).toBe('not-found')
  })
})
