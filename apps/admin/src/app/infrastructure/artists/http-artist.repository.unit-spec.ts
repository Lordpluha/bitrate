import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { ArtistRepository } from '@domain/artist'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ADMIN_API } from '../http/api.config'
import { HttpArtistRepository } from './http-artist.repository'

const BASE = `${ADMIN_API}/artists`

const PAGE_RESPONSE = { data: [], total: 0, page: 1, limit: 20 }

describe('HttpArtistRepository.list', () => {
  let repository: ArtistRepository
  let http: HttpTestingController

  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ArtistRepository, useClass: HttpArtistRepository },
      ],
    })

    repository = TestBed.inject(ArtistRepository)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  it('sends sort and order together when a sort is set', () => {
    void repository.list({
      page: 1,
      filter: { sort: { field: 'monthlyListeners', direction: 'desc' } },
    })

    const request = http.expectOne(
      (req) => req.url === BASE && req.params.get('sort') === 'monthlyListeners',
    )
    expect(request.request.params.get('order')).toBe('desc')
    request.flush(PAGE_RESPONSE)
  })

  it('sends neither sort nor order when no sort is set', () => {
    void repository.list({ page: 1, filter: {} })

    const request = http.expectOne((req) => req.url === BASE)
    expect(request.request.params.has('sort')).toBe(false)
    expect(request.request.params.has('order')).toBe(false)
    request.flush(PAGE_RESPONSE)
  })

  it('never sends order without sort', () => {
    void repository.list({ page: 1, filter: { query: 'dj' } })

    const request = http.expectOne((req) => req.url === BASE)
    expect(request.request.params.has('order')).toBe(false)
    request.flush(PAGE_RESPONSE)
  })

  it('sends the status filter when it is set', () => {
    void repository.list({ page: 1, filter: { status: 'deactivated' } })

    const request = http.expectOne(
      (req) => req.url === BASE && req.params.get('status') === 'deactivated',
    )
    request.flush(PAGE_RESPONSE)
  })
})

describe('HttpArtistRepository take-down writes', () => {
  let repository: ArtistRepository
  let http: HttpTestingController

  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ArtistRepository, useClass: HttpArtistRepository },
      ],
    })

    repository = TestBed.inject(ArtistRepository)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  it('sends a DELETE with the trimmed reason in the body', () => {
    void repository.deactivate({ id: 'a1', reason: '  rights claim  ' })

    const request = http.expectOne(`${BASE}/a1`)
    expect(request.request.method).toBe('DELETE')
    expect(request.request.body).toEqual({ reason: 'rights claim' })
    request.flush({})
  })

  it('omits the reason key entirely when none is given', () => {
    void repository.deactivate({ id: 'a1' })

    const request = http.expectOne(`${BASE}/a1`)
    expect(request.request.body).not.toHaveProperty('reason')
    request.flush({})
  })

  it('restores with a POST to /restore', () => {
    void repository.restore({ id: 'a1' })

    const request = http.expectOne(`${BASE}/a1/restore`)
    expect(request.request.method).toBe('POST')
    request.flush({})
  })

  it('revokes sessions and resolves the revoked count', async () => {
    const result = repository.revokeSessions({ id: 'a1' })

    const request = http.expectOne(`${BASE}/a1/sessions/revoke`)
    expect(request.request.method).toBe('POST')
    request.flush({ revoked: 3 })

    await expect(result).resolves.toBe(3)
  })

  it('maps a 409 on deactivate to already-deactivated', async () => {
    const result = repository.deactivate({ id: 'a1' })

    http.expectOne(`${BASE}/a1`).flush(null, { status: 409, statusText: 'Conflict' })

    await expect(result).rejects.toMatchObject({ reason: 'already-deactivated' })
  })

  it('maps a 409 on restore to not-deactivated', async () => {
    const result = repository.restore({ id: 'a1' })

    http.expectOne(`${BASE}/a1/restore`).flush(null, { status: 409, statusText: 'Conflict' })

    await expect(result).rejects.toMatchObject({ reason: 'not-deactivated' })
  })

  it('fetches a page of tracks for the given artist', async () => {
    const result = repository.listTracks('a1', 1)

    const request = http.expectOne((req) => req.url === `${BASE}/a1/tracks`)
    expect(request.request.params.get('page')).toBe('1')
    request.flush({
      data: [
        {
          id: 'a1b2c3d4-4f89-41d3-9a0c-0305e82c3301',
          title: 'Test Track',
          cover: null,
          processingStatus: 'READY',
          playCount: 1,
          deletedAt: null,
          createdAt: '2026-09-01T00:00:00.000Z',
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
    })

    await expect(result).resolves.toMatchObject({ total: 1 })
  })

  it('rejects when the tracks response fails schema validation', async () => {
    const result = repository.listTracks('a1', 1)

    http.expectOne((req) => req.url === `${BASE}/a1/tracks`).flush({ data: [] })

    await expect(result).rejects.toThrow()
  })

  it('fetches a page of albums for the given artist', async () => {
    const result = repository.listAlbums('a1', 1)

    const request = http.expectOne((req) => req.url === `${BASE}/a1/albums`)
    expect(request.request.params.get('page')).toBe('1')
    request.flush({
      data: [
        {
          id: 'a1b2c3d4-4f89-41d3-9a0c-0305e82c3302',
          title: 'Test Album',
          cover: null,
          type: 'ALBUM',
          totalTracks: 8,
          releaseDate: null,
          deletedAt: null,
          createdAt: '2026-09-01T00:00:00.000Z',
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
    })

    await expect(result).resolves.toMatchObject({ total: 1 })
  })

  it('rejects when the albums response fails schema validation', async () => {
    const result = repository.listAlbums('a1', 1)

    http.expectOne((req) => req.url === `${BASE}/a1/albums`).flush({ data: [] })

    await expect(result).rejects.toThrow()
  })
})
