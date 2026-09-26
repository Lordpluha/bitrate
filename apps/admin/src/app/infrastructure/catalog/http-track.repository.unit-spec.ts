import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { TrackRepository } from '@domain/track'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ADMIN_API } from '../http/api.config'
import { HttpTrackRepository } from './http-track.repository'

const BASE = `${ADMIN_API}/tracks`

const PAGE_RESPONSE = { data: [], total: 0, page: 1, limit: 20 }

const DETAIL_ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'

const DETAIL_RESPONSE = {
  id: DETAIL_ID,
  title: 'Night Drive',
  artistId: '3f2504e0-4f89-41d3-9a0c-0305e82c3302',
  artistUsername: 'dj-test',
  cover: null,
  processingStatus: 'READY',
  processingError: null,
  processingAttempts: 1,
  processingStartedAt: null,
  processingFinishedAt: '2026-09-01T10:02:00.000Z',
  deletedAt: null,
  updatedAt: '2026-09-01T10:02:00.000Z',
  createdAt: '2026-09-01T09:59:00.000Z',
  audioFiles: [],
  artists: [],
  genres: [],
  albums: [],
  openReportCount: 0,
}

describe('HttpTrackRepository.list', () => {
  let repository: TrackRepository
  let http: HttpTestingController

  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TrackRepository, useClass: HttpTrackRepository },
      ],
    })

    repository = TestBed.inject(TrackRepository)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  it('sends the take-down status filter when it is set', () => {
    void repository.list({ page: 1, filter: { status: 'deactivated' } })

    const request = http.expectOne(
      (req) => req.url === BASE && req.params.get('status') === 'deactivated',
    )
    request.flush(PAGE_RESPONSE)
  })

  it('omits the status filter when it is unset', () => {
    void repository.list({ page: 1, filter: {} })

    const request = http.expectOne((req) => req.url === BASE)
    expect(request.request.params.has('status')).toBe(false)
    request.flush(PAGE_RESPONSE)
  })
})

describe('HttpTrackRepository detail and take-down writes', () => {
  let repository: TrackRepository
  let http: HttpTestingController

  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TrackRepository, useClass: HttpTrackRepository },
      ],
    })

    repository = TestBed.inject(TrackRepository)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  it('fetches and maps the track detail', async () => {
    const result = repository.getById(DETAIL_ID)

    http.expectOne(`${BASE}/${DETAIL_ID}`).flush(DETAIL_RESPONSE)

    await expect(result).resolves.toMatchObject({ title: 'Night Drive', openReportCount: 0 })
  })

  it('sends a DELETE with the trimmed reason in the body for take-down', () => {
    void repository.takeDown({ id: 'a1', reason: '  rights claim  ' })

    const request = http.expectOne(`${BASE}/a1`)
    expect(request.request.method).toBe('DELETE')
    expect(request.request.body).toEqual({ reason: 'rights claim' })
    request.flush({})
  })

  it('restores with a POST to /restore', () => {
    void repository.restore({ id: 'a1' })

    const request = http.expectOne(`${BASE}/a1/restore`)
    expect(request.request.method).toBe('POST')
    request.flush({})
  })

  it('maps a 409 on take-down to already-deactivated', async () => {
    const result = repository.takeDown({ id: 'a1' })

    http.expectOne(`${BASE}/a1`).flush(null, { status: 409, statusText: 'Conflict' })

    await expect(result).rejects.toMatchObject({ reason: 'already-deactivated' })
  })

  it('maps a 409 on restore to not-deactivated', async () => {
    const result = repository.restore({ id: 'a1' })

    http.expectOne(`${BASE}/a1/restore`).flush(null, { status: 409, statusText: 'Conflict' })

    await expect(result).rejects.toMatchObject({ reason: 'not-deactivated' })
  })

  it('fetches processing attempts at the sub-resource with the page and limit', () => {
    void repository.listProcessingAttempts('a1', 2)

    const request = http.expectOne(
      (req) =>
        req.url === `${BASE}/a1/processing-attempts` &&
        req.params.get('page') === '2' &&
        req.params.get('limit') === '10',
    )
    request.flush({ data: [], total: 0, page: 2, limit: 10 })
  })

  it('propagates a 404 for an unknown track rather than mapping it to a write error', async () => {
    const result = repository.listProcessingAttempts('missing', 1)

    http
      .expectOne((req) => req.url === `${BASE}/missing/processing-attempts`)
      .flush(null, { status: 404, statusText: 'Not Found' })

    await expect(result).rejects.toBeTruthy()
  })

  it('issues a HEAD with the bitrate before resolving a GET URL', async () => {
    const result = repository.probeAudio({ id: 'a1', bitrate: 320 })

    const request = http.expectOne(
      (req) => req.url === `${BASE}/a1/audio` && req.params.get('bitrate') === '320',
    )
    expect(request.request.method).toBe('HEAD')
    request.flush(null)

    await expect(result).resolves.toEqual({ url: `${BASE}/a1/audio?bitrate=320`, bitrate: 320 })
  })

  it('surfaces a 401 from the probe rather than swallowing it', async () => {
    const result = repository.probeAudio({ id: 'a1', bitrate: 320 })

    http
      .expectOne((req) => req.url === `${BASE}/a1/audio`)
      .flush(null, { status: 401, statusText: 'Unauthorized' })

    await expect(result).rejects.toBeTruthy()
  })

  it('surfaces a 404 when the rendition is unavailable', async () => {
    const result = repository.probeAudio({ id: 'a1', bitrate: 999 })

    http
      .expectOne((req) => req.url === `${BASE}/a1/audio`)
      .flush(null, { status: 404, statusText: 'Not Found' })

    await expect(result).rejects.toBeTruthy()
  })
})
