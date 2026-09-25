import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { UserRepository } from '@domain/user'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ADMIN_API } from '../http/api.config'
import { HttpUserRepository } from './http-user.repository'

const BASE = `${ADMIN_API}/users`

const DETAIL_RESPONSE = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  username: 'listener',
  email: 'listener@example.com',
  avatar: null,
  description: null,
  twoFactorEnabled: false,
  emailVerifiedAt: null,
  failedLoginAttempts: 0,
  lockedUntil: null,
  deletedAt: null,
  createdAt: '2026-09-01T09:59:00.000Z',
  updatedAt: '2026-09-01T09:59:00.000Z',
  counts: { playlists: 1, likedTracks: 2, listeningHistory: 3, reportsFiled: 0, activeSessions: 1 },
}

describe('HttpUserRepository', () => {
  let repository: UserRepository
  let http: HttpTestingController

  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserRepository, useClass: HttpUserRepository },
      ],
    })

    repository = TestBed.inject(UserRepository)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  it('parses a detail response into a UserDetail with counts', async () => {
    const result = repository.getById(DETAIL_RESPONSE.id)

    http.expectOne(`${BASE}/${DETAIL_RESPONSE.id}`).flush(DETAIL_RESPONSE)

    await expect(result).resolves.toMatchObject({
      id: DETAIL_RESPONSE.id,
      username: 'listener',
      counts: { playlists: 1, activeSessions: 1 },
    })
  })

  it('throws instead of returning a detail response missing a required field', async () => {
    const { counts: _counts, ...malformed } = DETAIL_RESPONSE

    const result = repository.getById(DETAIL_RESPONSE.id)
    http.expectOne(`${BASE}/${DETAIL_RESPONSE.id}`).flush(malformed)

    await expect(result).rejects.toThrow()
  })

  it('sends a DELETE with the trimmed reason in the body', () => {
    void repository.deactivate({ id: 'u1', reason: '  spam  ' })

    const request = http.expectOne(`${BASE}/u1`)
    expect(request.request.method).toBe('DELETE')
    expect(request.request.body).toEqual({ reason: 'spam' })
    request.flush({})
  })

  it('omits the reason key entirely when none is given', () => {
    void repository.deactivate({ id: 'u1' })

    const request = http.expectOne(`${BASE}/u1`)
    expect(request.request.body).not.toHaveProperty('reason')
    request.flush({})
  })

  it('revokes sessions and resolves the revoked count', async () => {
    const result = repository.revokeSessions({ id: 'u1' })

    const request = http.expectOne(`${BASE}/u1/sessions/revoke`)
    expect(request.request.method).toBe('POST')
    request.flush({ revoked: 2 })

    await expect(result).resolves.toBe(2)
  })

  it('maps a 404 on restore to not-found', async () => {
    const result = repository.restore({ id: 'u1' })

    http.expectOne(`${BASE}/u1/restore`).flush(null, { status: 404, statusText: 'Not Found' })

    await expect(result).rejects.toMatchObject({ reason: 'not-found' })
  })

  it('fetches a page of listening history for the given listener', async () => {
    const result = repository.listListeningHistory('u1', 1)

    const request = http.expectOne((req) => req.url === `${BASE}/u1/listening-history`)
    expect(request.request.params.get('page')).toBe('1')
    request.flush({
      data: [
        {
          id: 'a1b2c3d4-4f89-41d3-9a0c-0305e82c3301',
          listenedAt: '2026-09-17T12:00:00.000Z',
          trackId: 'a1b2c3d4-4f89-41d3-9a0c-0305e82c3302',
          trackTitle: 'Test Track',
          artistUsername: 'dj-test',
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
    })

    await expect(result).resolves.toMatchObject({ total: 1 })
  })

  it('rejects when the listening-history response fails schema validation', async () => {
    const result = repository.listListeningHistory('u1', 1)

    http.expectOne((req) => req.url === `${BASE}/u1/listening-history`).flush({ data: [] })

    await expect(result).rejects.toThrow()
  })
})
