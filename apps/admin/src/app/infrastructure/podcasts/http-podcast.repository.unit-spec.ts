import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { PodcastRepository } from '@domain/podcast'
import { ResourceWriteError } from '@domain/shared'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ADMIN_API } from '../http/api.config'
import { HttpPodcastRepository } from './http-podcast.repository'

const BASE = `${ADMIN_API}/podcasts`
const ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'
const EPISODE_ID = '5f2504e0-4f89-41d3-9a0c-0305e82c3305'
const EPISODE_URL = `${BASE}/${ID}/episodes/${EPISODE_ID}`

const PODCAST_RESPONSE = {
  id: ID,
  title: 'Signal Hour',
  publisher: 'Bitrate FM',
  cover: 'signal-hour.webp',
  language: 'en',
  explicit: false,
  episodeCount: 3,
  deletedAt: null,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-02T00:00:00.000Z',
}

const EPISODE_RESPONSE = {
  id: EPISODE_ID,
  podcastId: ID,
  title: 'Episode 1',
  duration: 1800,
  releaseDate: '2026-09-01T00:00:00.000Z',
  explicit: false,
  deletedAt: null,
}

describe('HttpPodcastRepository', () => {
  let repository: PodcastRepository
  let http: HttpTestingController

  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PodcastRepository, useClass: HttpPodcastRepository },
      ],
    })

    repository = TestBed.inject(PodcastRepository)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  it('lists a page, sending filters and sort, and maps the rows', async () => {
    const page = repository.list({
      page: 2,
      limit: 20,
      filter: {
        query: 'signal',
        status: 'deactivated',
        sort: { field: 'title', direction: 'asc' },
      },
    })

    const request = http.expectOne((candidate) => candidate.url === BASE)
    expect(request.request.params.get('q')).toBe('signal')
    expect(request.request.params.get('status')).toBe('deactivated')
    expect(request.request.params.get('sort')).toBe('title')
    expect(request.request.params.get('order')).toBe('asc')
    request.flush({ data: [PODCAST_RESPONSE], total: 1, page: 2, limit: 20 })

    const result = await page
    expect(result.items[0]).toMatchObject({
      title: 'Signal Hour',
      publisher: 'Bitrate FM',
      episodeCount: 3,
      takenDownAt: null,
    })
    expect(result.items[0]?.coverUrl).toContain('/static/podcasts/covers/signal-hour.webp')
  })

  it('keeps an absolute cover URL and treats an absent optional field as no value', async () => {
    const page = repository.list({ page: 1, filter: {} })
    const { language: _language, ...bare } = PODCAST_RESPONSE

    http
      .expectOne((candidate) => candidate.url === BASE)
      .flush({
        data: [{ ...bare, cover: 'https://cdn.example/cover.png' }],
        total: 1,
        page: 1,
        limit: 20,
      })

    const [podcast] = (await page).items
    expect(podcast?.coverUrl).toBe('https://cdn.example/cover.png')
    expect(podcast?.language).toBeNull()
  })

  it('rejects a response that does not match the contract', async () => {
    const page = repository.list({ page: 1, filter: {} })

    http
      .expectOne((candidate) => candidate.url === BASE)
      .flush({
        data: [{ ...PODCAST_RESPONSE, episodeCount: 'many' }],
        total: 1,
        page: 1,
        limit: 20,
      })

    await expect(page).rejects.toThrow()
  })

  it('loads a podcast with every episode carrying its own take-down state', async () => {
    const detail = repository.getById(ID)

    http.expectOne(`${BASE}/${ID}`).flush({
      ...PODCAST_RESPONSE,
      deletedAt: '2026-09-04T00:00:00.000Z',
      description: null,
      episodes: [
        EPISODE_RESPONSE,
        {
          ...EPISODE_RESPONSE,
          id: '5f2504e0-4f89-41d3-9a0c-0305e82c3306',
          deletedAt: '2026-09-03T00:00:00.000Z',
        },
      ],
    })

    const result = await detail
    expect(result.takenDownAt).toEqual(new Date('2026-09-04T00:00:00.000Z'))
    expect(result.description).toBeNull()
    expect(result.episodes[0]).toMatchObject({ durationSeconds: 1800, takenDownAt: null })
    expect(result.episodes[1]?.takenDownAt).toEqual(new Date('2026-09-03T00:00:00.000Z'))
  })

  it('takes a podcast down with the trimmed reason in the request body', async () => {
    const done = repository.takeDown({ id: ID, reason: '  rights claim ' })

    const request = http.expectOne(`${BASE}/${ID}`)
    expect(request.request.method).toBe('DELETE')
    expect(request.request.body).toEqual({ reason: 'rights claim' })
    request.flush(PODCAST_RESPONSE)

    await expect(done).resolves.toBeUndefined()
  })

  it('restores a podcast and omits a blank reason', async () => {
    const done = repository.restore({ id: ID, reason: '   ' })

    const request = http.expectOne(`${BASE}/${ID}/restore`)
    expect(request.request.method).toBe('POST')
    expect(request.request.body).toEqual({})
    request.flush(PODCAST_RESPONSE)

    await expect(done).resolves.toBeUndefined()
  })

  it('takes an episode down and restores it through its podcast path', async () => {
    const down = repository.takeDownEpisode({
      podcastId: ID,
      episodeId: EPISODE_ID,
      reason: 'dmca',
    })
    const downRequest = http.expectOne(EPISODE_URL)
    expect(downRequest.request.method).toBe('DELETE')
    expect(downRequest.request.body).toEqual({ reason: 'dmca' })
    downRequest.flush(EPISODE_RESPONSE)
    await expect(down).resolves.toBeUndefined()

    const up = repository.restoreEpisode({ podcastId: ID, episodeId: EPISODE_ID })
    const upRequest = http.expectOne(`${EPISODE_URL}/restore`)
    expect(upRequest.request.method).toBe('POST')
    expect(upRequest.request.body).toEqual({})
    upRequest.flush(EPISODE_RESPONSE)
    await expect(up).resolves.toBeUndefined()
  })

  it('maps a 409 on take-down to already-deactivated and on restore to not-deactivated', async () => {
    const takeDown = repository.takeDown({ id: ID })
    http.expectOne(`${BASE}/${ID}`).flush(null, { status: 409, statusText: 'Conflict' })
    const takeDownError = await takeDown.catch((caught: unknown) => caught)
    expect(takeDownError).toBeInstanceOf(ResourceWriteError)
    expect((takeDownError as ResourceWriteError).reason).toBe('already-deactivated')

    const restore = repository.restoreEpisode({ podcastId: ID, episodeId: EPISODE_ID })
    http.expectOne(`${EPISODE_URL}/restore`).flush(null, { status: 409, statusText: 'Conflict' })
    const restoreError = await restore.catch((caught: unknown) => caught)
    expect((restoreError as ResourceWriteError).reason).toBe('not-deactivated')
  })

  it('maps a 404 on an episode of another podcast to not-found', async () => {
    const done = repository.takeDownEpisode({ podcastId: ID, episodeId: EPISODE_ID })

    http.expectOne(EPISODE_URL).flush(null, { status: 404, statusText: 'Not Found' })

    const error = await done.catch((caught: unknown) => caught)
    expect((error as ResourceWriteError).reason).toBe('not-found')
  })
})
