import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { AlbumRepository } from '@domain/album'
import { ResourceWriteError } from '@domain/shared'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ADMIN_API } from '../http/api.config'
import { HttpAlbumRepository } from './http-album.repository'

const BASE = `${ADMIN_API}/albums`
const ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'

const ALBUM_RESPONSE = {
  id: ID,
  title: 'Night Signal',
  cover: 'night-signal.webp',
  artistId: '9f2504e0-4f89-41d3-9a0c-0305e82c3302',
  artistUsername: 'dj-test',
  type: 'EP',
  totalTracks: 2,
  releaseDate: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-02T00:00:00.000Z',
}

describe('HttpAlbumRepository', () => {
  let repository: AlbumRepository
  let http: HttpTestingController

  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AlbumRepository, useClass: HttpAlbumRepository },
      ],
    })

    repository = TestBed.inject(AlbumRepository)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  it('lists a page, sending filters and sort, and maps the rows', async () => {
    const page = repository.list({
      page: 2,
      limit: 20,
      filter: {
        query: 'night',
        status: 'deactivated',
        artistId: ALBUM_RESPONSE.artistId,
        sort: { field: 'releaseDate', direction: 'desc' },
      },
    })

    const request = http.expectOne((candidate) => candidate.url === BASE)
    expect(request.request.params.get('q')).toBe('night')
    expect(request.request.params.get('status')).toBe('deactivated')
    expect(request.request.params.get('artistId')).toBe(ALBUM_RESPONSE.artistId)
    expect(request.request.params.get('sort')).toBe('releaseDate')
    expect(request.request.params.get('order')).toBe('desc')
    request.flush({ data: [ALBUM_RESPONSE], total: 1, page: 2, limit: 20 })

    const result = await page
    expect(result.items[0]).toMatchObject({
      title: 'Night Signal',
      artistUsername: 'dj-test',
      type: 'EP',
      takenDownAt: null,
      releaseDate: new Date('2026-01-01T00:00:00.000Z'),
    })
    expect(result.items[0]?.coverUrl).toContain('/static/albums/covers/night-signal.webp')
  })

  it('treats an absent optional field as no value', async () => {
    const page = repository.list({ page: 1, filter: {} })
    const { cover: _cover, releaseDate: _released, ...bare } = ALBUM_RESPONSE

    http
      .expectOne((candidate) => candidate.url === BASE)
      .flush({
        data: [bare],
        total: 1,
        page: 1,
        limit: 20,
      })

    const [album] = (await page).items
    expect(album?.coverUrl).toBeNull()
    expect(album?.releaseDate).toBeNull()
  })

  it('rejects a response whose album type is not in the contract', async () => {
    const page = repository.list({ page: 1, filter: {} })

    http
      .expectOne((candidate) => candidate.url === BASE)
      .flush({
        data: [{ ...ALBUM_RESPONSE, type: 'MIXTAPE' }],
        total: 1,
        page: 1,
        limit: 20,
      })

    await expect(page).rejects.toThrow()
  })

  it('loads an album with its tracks in the order the API sent', async () => {
    const detail = repository.getById(ID)

    http.expectOne(`${BASE}/${ID}`).flush({
      ...ALBUM_RESPONSE,
      description: null,
      tracks: [
        {
          id: '1f2504e0-4f89-41d3-9a0c-0305e82c3311',
          title: 'Intro',
          trackNumber: 1,
          discNumber: 1,
          processingStatus: 'READY',
          deletedAt: null,
        },
        {
          id: '1f2504e0-4f89-41d3-9a0c-0305e82c3312',
          title: 'Outro',
          trackNumber: 2,
          discNumber: 1,
          processingStatus: 'FAILED',
          deletedAt: '2026-09-03T00:00:00.000Z',
        },
      ],
    })

    const result = await detail
    expect(result.label).toBeNull()
    expect(result.tracks.map((track) => track.title)).toEqual(['Intro', 'Outro'])
    expect(result.tracks[1]).toMatchObject({
      processingStatus: 'FAILED',
      takenDownAt: new Date('2026-09-03T00:00:00.000Z'),
    })
  })

  it('takes an album down with the trimmed reason in the request body', async () => {
    const done = repository.takeDown({ id: ID, reason: '  rights claim ' })

    const request = http.expectOne(`${BASE}/${ID}`)
    expect(request.request.method).toBe('DELETE')
    expect(request.request.body).toEqual({ reason: 'rights claim' })
    request.flush(ALBUM_RESPONSE)

    await expect(done).resolves.toBeUndefined()
  })

  it('restores an album and omits a blank reason', async () => {
    const done = repository.restore({ id: ID, reason: '   ' })

    const request = http.expectOne(`${BASE}/${ID}/restore`)
    expect(request.request.method).toBe('POST')
    expect(request.request.body).toEqual({})
    request.flush(ALBUM_RESPONSE)

    await expect(done).resolves.toBeUndefined()
  })

  it('maps a 409 on take-down to already-deactivated and on restore to not-deactivated', async () => {
    const takeDown = repository.takeDown({ id: ID })
    http.expectOne(`${BASE}/${ID}`).flush(null, { status: 409, statusText: 'Conflict' })
    const takeDownError = await takeDown.catch((caught: unknown) => caught)
    expect(takeDownError).toBeInstanceOf(ResourceWriteError)
    expect((takeDownError as ResourceWriteError).reason).toBe('already-deactivated')

    const restore = repository.restore({ id: ID })
    http.expectOne(`${BASE}/${ID}/restore`).flush(null, { status: 409, statusText: 'Conflict' })
    const restoreError = await restore.catch((caught: unknown) => caught)
    expect((restoreError as ResourceWriteError).reason).toBe('not-deactivated')
  })

  it('maps a 404 to not-found', async () => {
    const done = repository.takeDown({ id: ID })

    http.expectOne(`${BASE}/${ID}`).flush(null, { status: 404, statusText: 'Not Found' })

    const error = await done.catch((caught: unknown) => caught)
    expect((error as ResourceWriteError).reason).toBe('not-found')
  })
})
