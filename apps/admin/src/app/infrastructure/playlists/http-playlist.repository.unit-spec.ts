import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { PlaylistRepository } from '@domain/playlist'
import { ResourceWriteError } from '@domain/shared'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ADMIN_API } from '../http/api.config'
import { HttpPlaylistRepository } from './http-playlist.repository'

const BASE = `${ADMIN_API}/playlists`
const ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'

const PLAYLIST_RESPONSE = {
  id: ID,
  title: 'Night Drive',
  cover: null,
  ownerId: '9f2504e0-4f89-41d3-9a0c-0305e82c3302',
  ownerUsername: 'listener',
  isPublic: true,
  followersCount: 3,
  trackCount: 2,
  deletedAt: null,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-02T00:00:00.000Z',
}

describe('HttpPlaylistRepository', () => {
  let repository: PlaylistRepository
  let http: HttpTestingController

  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PlaylistRepository, useClass: HttpPlaylistRepository },
      ],
    })

    repository = TestBed.inject(PlaylistRepository)
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
        ownerId: PLAYLIST_RESPONSE.ownerId,
        sort: { field: 'title', direction: 'desc' },
      },
    })

    const request = http.expectOne((candidate) => candidate.url === BASE)
    expect(request.request.params.get('q')).toBe('night')
    expect(request.request.params.get('status')).toBe('deactivated')
    expect(request.request.params.get('ownerId')).toBe(PLAYLIST_RESPONSE.ownerId)
    expect(request.request.params.get('sort')).toBe('title')
    expect(request.request.params.get('order')).toBe('desc')
    request.flush({ data: [PLAYLIST_RESPONSE], total: 1, page: 2, limit: 20 })

    const result = await page
    expect(result.items[0]).toMatchObject({
      title: 'Night Drive',
      ownerUsername: 'listener',
      isPublic: true,
      trackCount: 2,
      takenDownAt: null,
    })
  })

  it('loads a playlist with its tracks in the order the API sent', async () => {
    const detail = repository.getById(ID)

    http.expectOne(`${BASE}/${ID}`).flush({
      ...PLAYLIST_RESPONSE,
      isPublic: false,
      deletedAt: '2026-09-03T00:00:00.000Z',
      collaborative: true,
      tracks: [
        { id: '1f2504e0-4f89-41d3-9a0c-0305e82c3311', title: 'Intro', position: 0 },
        { id: '1f2504e0-4f89-41d3-9a0c-0305e82c3312', title: 'Outro', position: 1 },
      ],
    })

    const result = await detail
    expect(result.description).toBeNull()
    expect(result.collaborative).toBe(true)
    expect(result.isPublic).toBe(false)
    expect(result.takenDownAt).toEqual(new Date('2026-09-03T00:00:00.000Z'))
    expect(result.tracks.map((track) => track.title)).toEqual(['Intro', 'Outro'])
  })

  it('hides a playlist with a PATCH carrying isPublic false and the trimmed reason', async () => {
    const done = repository.setVisibility({ id: ID, isPublic: false, reason: '  misleading ' })

    const request = http.expectOne(`${BASE}/${ID}/visibility`)
    expect(request.request.method).toBe('PATCH')
    expect(request.request.body).toEqual({ isPublic: false, reason: 'misleading' })
    request.flush(PLAYLIST_RESPONSE)

    await expect(done).resolves.toBeUndefined()
  })

  it('un-hides with isPublic true and omits a blank reason', async () => {
    const done = repository.setVisibility({ id: ID, isPublic: true, reason: '   ' })

    const request = http.expectOne(`${BASE}/${ID}/visibility`)
    expect(request.request.body).toEqual({ isPublic: true })
    request.flush(PLAYLIST_RESPONSE)

    await expect(done).resolves.toBeUndefined()
  })

  it('maps a 409 on a visibility change to visibility-conflict', async () => {
    const done = repository.setVisibility({ id: ID, isPublic: true })

    http.expectOne(`${BASE}/${ID}/visibility`).flush(null, { status: 409, statusText: 'Conflict' })

    const error = await done.catch((caught: unknown) => caught)
    expect(error).toBeInstanceOf(ResourceWriteError)
    expect((error as ResourceWriteError).reason).toBe('visibility-conflict')
  })

  it('takes a playlist down with the trimmed reason in the request body', async () => {
    const done = repository.takeDown({ id: ID, reason: '  spam ' })

    const request = http.expectOne(`${BASE}/${ID}`)
    expect(request.request.method).toBe('DELETE')
    expect(request.request.body).toEqual({ reason: 'spam' })
    request.flush(PLAYLIST_RESPONSE)

    await expect(done).resolves.toBeUndefined()
  })

  it('restores a playlist and omits a blank reason', async () => {
    const done = repository.restore({ id: ID, reason: '   ' })

    const request = http.expectOne(`${BASE}/${ID}/restore`)
    expect(request.request.method).toBe('POST')
    expect(request.request.body).toEqual({})
    request.flush(PLAYLIST_RESPONSE)

    await expect(done).resolves.toBeUndefined()
  })

  it('maps a 409 on take-down to already-deactivated and on restore to not-deactivated', async () => {
    const takeDown = repository.takeDown({ id: ID })
    http.expectOne(`${BASE}/${ID}`).flush(null, { status: 409, statusText: 'Conflict' })
    const takeDownError = await takeDown.catch((caught: unknown) => caught)
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
