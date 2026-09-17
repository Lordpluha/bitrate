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
})
