import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { closeE2eApp, createE2eApp, makeRunId, registerAndLogin } from './e2e-app'

// Well-formed v4 UUID that matches no album; ParseUUIDPipe rejects ids without a valid version.
const MISSING_ALBUM_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'

let app: INestApplication

describe('AlbumsController (e2e)', () => {
  beforeAll(async () => {
    const setup = await createE2eApp()
    app = setup.app
  })

  afterAll(async () => {
    await closeE2eApp(app)
  })

  it('full user scenario: register -> login -> create -> read -> update -> delete', async () => {
    const { cookies } = await registerAndLogin(app, 'artist')

    const createResponse = await request(app.getHttpServer())
      .post('/albums')
      .set('Cookie', cookies)
      .send({ title: 'Album title', description: 'desc', rightsConfirmed: true })
      .expect(201)

    const albumId = createResponse.body.id as string

    await request(app.getHttpServer()).get('/albums').query({ page: 1, limit: 10 }).expect(200)

    await request(app.getHttpServer()).get(`/albums/${albumId}`).expect(200)

    await request(app.getHttpServer())
      .put(`/albums/${albumId}`)
      .set('Cookie', cookies)
      .send({ title: 'Updated Album' })
      .expect(200)

    await request(app.getHttpServer())
      .delete(`/albums/${albumId}`)
      .set('Cookie', cookies)
      .expect(200)
  })

  it('GET /albums should support title filter', async () => {
    const { cookies } = await registerAndLogin(app, 'artist')
    const runId = makeRunId()

    await request(app.getHttpServer())
      .post('/albums')
      .set('Cookie', cookies)
      .send({ title: `Rock Album ${runId}`, description: 'desc', rightsConfirmed: true })
      .expect(201)

    const response = await request(app.getHttpServer())
      .get('/albums')
      .query({ title: 'rock', page: 1, limit: 10 })
      .expect(200)

    expect(Array.isArray(response.body.data)).toBe(true)
    expect(response.body.data.length).toBeGreaterThan(0)
    expect(
      response.body.data.some((album: { title?: string }) =>
        album.title?.toLowerCase().includes('rock'),
      ),
    ).toBe(true)
  })

  it('GET /albums should filter case-insensitively', async () => {
    const { cookies } = await registerAndLogin(app, 'artist')
    const runId = makeRunId()

    await request(app.getHttpServer())
      .post('/albums')
      .set('Cookie', cookies)
      .send({ title: `RoCk Case ${runId}`, description: 'desc', rightsConfirmed: true })
      .expect(201)

    const response = await request(app.getHttpServer())
      .get('/albums')
      .query({ title: 'rock', page: 1, limit: 10 })
      .expect(200)

    expect(Array.isArray(response.body.data)).toBe(true)
    expect(response.body.data.length).toBeGreaterThan(0)
    expect(
      response.body.data.some((album: { title?: string }) =>
        album.title?.toLowerCase().includes('rock'),
      ),
    ).toBe(true)
  })

  it('GET /albums should accept pagination boundaries', async () => {
    await request(app.getHttpServer()).get('/albums').query({ page: 1, limit: 1 }).expect(200)
  })

  it('GET /albums should reject invalid pagination', async () => {
    await request(app.getHttpServer()).get('/albums').query({ page: 'nope' }).expect(400)
  })

  it('GET /albums/:id should reject invalid uuid', async () => {
    await request(app.getHttpServer()).get('/albums/not-uuid').expect(400)
  })

  it('GET /albums/:id should return empty body for missing album', async () => {
    const response = await request(app.getHttpServer())
      .get(`/albums/${MISSING_ALBUM_ID}`)
      .expect(200)

    expect(response.body).toEqual({})
  })

  it('PUT /albums/:id should return 404 for missing album', async () => {
    const { cookies } = await registerAndLogin(app, 'artist')

    await request(app.getHttpServer())
      .put(`/albums/${MISSING_ALBUM_ID}`)
      .set('Cookie', cookies)
      .send({ title: 'Updated Album' })
      .expect(404)
  })

  it('POST /albums should reject without auth', async () => {
    await request(app.getHttpServer()).post('/albums').send({ title: 'No Auth' }).expect(401)
  })

  it('PUT /albums/:id should reject without auth', async () => {
    await request(app.getHttpServer())
      .put(`/albums/${MISSING_ALBUM_ID}`)
      .send({ title: 'Should Fail' })
      .expect(401)
  })

  it('DELETE /albums/:id should reject without auth', async () => {
    await request(app.getHttpServer()).delete(`/albums/${MISSING_ALBUM_ID}`).expect(401)
  })
})
