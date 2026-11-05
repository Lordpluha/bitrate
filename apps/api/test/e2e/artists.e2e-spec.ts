import type { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { resetArtistsDatabase } from '../helpers/db'
import { closeE2eApp, createE2eApp, registerAndLogin } from './e2e-app'

describe('ArtistsController (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const setup = await createE2eApp()
    app = setup.app
    prisma = setup.prisma
  })

  afterAll(async () => {
    await closeE2eApp(app)
  })

  beforeEach(async () => {
    await resetArtistsDatabase(prisma)
  })

  it('GET /artists should return 200 with empty list initially', async () => {
    const res = await request(app.getHttpServer()).get('/artists').query({ page: 1, limit: 10 })

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('GET /artists/:id with invalid UUID should return 400', async () => {
    await request(app.getHttpServer()).get('/artists/not-a-uuid').expect(400)
  })

  it('full artist CRUD: register -> get by username -> update -> get by id', async () => {
    const { cookies, username } = await registerAndLogin(app, 'artist')

    const byUsernameRes = await request(app.getHttpServer())
      .get(`/artists/username/${username}`)
      .expect(200)

    expect(byUsernameRes.body).toMatchObject({ username })
    const artistId = byUsernameRes.body.id

    const updateRes = await request(app.getHttpServer())
      .put(`/artists/${artistId}`)
      .set('Cookie', cookies)
      .send({ bio: 'My artist bio' })
      .expect(200)

    expect(updateRes.body).toMatchObject({ bio: 'My artist bio' })

    const byIdRes = await request(app.getHttpServer()).get(`/artists/${artistId}`).expect(200)
    expect(byIdRes.body.id).toBe(artistId)
  })

  it('PUT /artists/:id should return 401 without auth', async () => {
    const { runId } = await registerAndLogin(app, 'artist')

    const byUsernameRes = await request(app.getHttpServer())
      .get(`/artists/username/artist_${runId}`)
      .expect(200)

    await request(app.getHttpServer())
      .put(`/artists/${byUsernameRes.body.id}`)
      .send({ bio: 'No auth' })
      .expect(401)
  })

  it('DELETE /artists/:id should delete the authenticated artist', async () => {
    const { cookies, runId } = await registerAndLogin(app, 'artist')

    const byUsernameRes = await request(app.getHttpServer())
      .get(`/artists/username/artist_${runId}`)
      .expect(200)

    const deleteRes = await request(app.getHttpServer())
      .delete(`/artists/${byUsernameRes.body.id}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(deleteRes.body).toMatchObject({ id: byUsernameRes.body.id })

    const getRes = await request(app.getHttpServer())
      .get(`/artists/${byUsernameRes.body.id}`)
      .expect(200)

    // A soft-deleted artist is no longer found, and a null service result
    // reaches the client as an empty body rather than a literal null.
    expect(getRes.body).toEqual({})
  })

  it('DELETE /artists/:id should return 401 without auth', async () => {
    const { runId } = await registerAndLogin(app, 'artist')

    const byUsernameRes = await request(app.getHttpServer())
      .get(`/artists/username/artist_${runId}`)
      .expect(200)

    await request(app.getHttpServer()).delete(`/artists/${byUsernameRes.body.id}`).expect(401)
  })
})
