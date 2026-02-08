import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { closeE2eApp, createE2eApp } from './e2e-app'

const makeRunId = () => Math.random().toString(36).slice(2, 8)

let app: INestApplication

const registerAndLoginArtist = async () => {
  const runId = makeRunId()
  const registration = {
    email: `artist_${runId}@example.com`,
    password: 'password123',
    username: `artist_${runId}`,
  }

  await request(app.getHttpServer())
    .post('/artists/auth/registration')
    .send(registration)
    .expect(201)

  const loginResponse = await request(app.getHttpServer())
    .post('/artists/auth/login')
    .send({ email: registration.email, password: registration.password })
    .expect(201)

  const cookies = loginResponse.headers['set-cookie']
  expect(cookies).toBeDefined()
  if (!cookies) throw new Error('Auth cookies were not set')

  return { cookies, registration }
}

describe('AlbumsController (e2e)', () => {
  beforeAll(async () => {
    const setup = await createE2eApp()
    app = setup.app
  })

  afterAll(async () => {
    await closeE2eApp(app)
  })

  it('full user scenario: register -> login -> create -> read -> update -> delete', async () => {
    const { cookies } = await registerAndLoginArtist()

    const createResponse = await request(app.getHttpServer())
      .post('/albums')
      .set('Cookie', cookies)
      .send({ title: 'Album title', description: 'desc' })
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
    const { cookies } = await registerAndLoginArtist()
    const runId = makeRunId()

    await request(app.getHttpServer())
      .post('/albums')
      .set('Cookie', cookies)
      .send({ title: `Rock Album ${runId}`, description: 'desc' })
      .expect(201)

    const response = await request(app.getHttpServer())
      .get('/albums')
      .query({ title: 'rock', page: 1, limit: 10 })
      .expect(200)

    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body.length).toBeGreaterThan(0)
    expect(
      response.body.some((album: { title?: string }) =>
        album.title?.toLowerCase().includes('rock'),
      ),
    ).toBe(true)
  })

  it('GET /albums should filter case-insensitively', async () => {
    const { cookies } = await registerAndLoginArtist()
    const runId = makeRunId()

    await request(app.getHttpServer())
      .post('/albums')
      .set('Cookie', cookies)
      .send({ title: `RoCk Case ${runId}`, description: 'desc' })
      .expect(201)

    const response = await request(app.getHttpServer())
      .get('/albums')
      .query({ title: 'rock', page: 1, limit: 10 })
      .expect(200)

    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body.length).toBeGreaterThan(0)
    expect(
      response.body.some((album: { title?: string }) =>
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
      .get('/albums/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
      .expect(200)

    expect(response.body).toEqual({})
  })

  it('PUT /albums/:id should return 404 for missing album', async () => {
    const { cookies } = await registerAndLoginArtist()

    await request(app.getHttpServer())
      .put('/albums/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
      .set('Cookie', cookies)
      .send({ title: 'Updated Album' })
      .expect(404)
  })

  it('POST /albums should reject without auth', async () => {
    await request(app.getHttpServer()).post('/albums').send({ title: 'No Auth' }).expect(401)
  })

  it('PUT /albums/:id should reject without auth', async () => {
    await request(app.getHttpServer())
      .put('/albums/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
      .send({ title: 'Should Fail' })
      .expect(401)
  })

  it('DELETE /albums/:id should reject without auth', async () => {
    await request(app.getHttpServer())
      .delete('/albums/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
      .expect(401)
  })
})
