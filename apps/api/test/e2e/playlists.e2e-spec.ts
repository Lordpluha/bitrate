import type { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { resetUsersDatabase } from '../helpers/db'
import { closeE2eApp, createE2eApp, registerAndLogin } from './e2e-app'

describe('PlaylistsController (e2e)', () => {
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
    await resetUsersDatabase(prisma)
  })

  it('GET /playlists should return 200 with a canonical paginated response', async () => {
    const res = await request(app.getHttpServer()).get('/playlists')

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ data: [], total: 0, page: 1, limit: 10 })
  })

  it('GET /playlists/:id with invalid UUID should return 400', async () => {
    await request(app.getHttpServer()).get('/playlists/not-a-uuid').expect(400)
  })

  it('POST /playlists should return 401 without auth', async () => {
    await request(app.getHttpServer())
      .post('/playlists')
      .send({ title: 'My Playlist', isPublic: true, description: null })
      .expect(401)
  })

  it('full playlist scenario: create -> get by id -> update', async () => {
    const { cookies, runId } = await registerAndLogin(app, 'user')

    const createRes = await request(app.getHttpServer())
      .post('/playlists')
      .set('Cookie', cookies)
      .send({ title: `Playlist ${runId}`, isPublic: true, description: 'E2E playlist' })
      .expect(201)

    const playlistId = createRes.body.id
    expect(createRes.body).toMatchObject({ title: `Playlist ${runId}` })

    const getRes = await request(app.getHttpServer()).get(`/playlists/${playlistId}`).expect(200)
    expect(getRes.body.id).toBe(playlistId)

    const updateRes = await request(app.getHttpServer())
      .put(`/playlists/${playlistId}`)
      .set('Cookie', cookies)
      .send({ title: `Updated ${runId}` })
      .expect(200)

    expect(updateRes.body).toMatchObject({ title: `Updated ${runId}` })
  })
})
