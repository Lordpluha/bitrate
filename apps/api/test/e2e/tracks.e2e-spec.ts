import type { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { resetArtistsDatabase, resetUsersDatabase } from '../helpers/db'
import { closeE2eApp, createE2eApp, registerAndLogin } from './e2e-app'

describe('TracksController (e2e)', () => {
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
    await resetArtistsDatabase(prisma)
  })

  it('GET /tracks should return 200 with paginated response', async () => {
    const res = await request(app.getHttpServer()).get('/tracks')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body).toMatchObject({ total: expect.any(Number), page: 1, limit: 10 })
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('never returns the master storage key (audioUrl) to listeners (#522)', async () => {
    const runId = Date.now().toString(36)
    const artist = await prisma.artist.create({
      data: {
        email: `artist_${runId}@example.com`,
        username: `Hidden Master ${runId}`,
        emailVerifiedAt: new Date(),
      },
    })
    const track = await prisma.track.create({
      data: {
        title: `Hidden Master ${runId}`,
        audioUrl: 'tracks/master/secret-key.wav',
        artistId: artist.id,
        processingStatus: 'READY',
        publishedAt: new Date(Date.now() - 60_000),
      },
    })

    const detail = await request(app.getHttpServer()).get(`/tracks/${track.id}`).expect(200)
    const list = await request(app.getHttpServer()).get('/tracks').expect(200)

    expect(detail.body.id).toBe(track.id)
    expect(detail.body).not.toHaveProperty('audioUrl')
    expect(JSON.stringify(list.body)).not.toContain('secret-key')
    const stored = await prisma.track.findUnique({
      where: { id: track.id },
      select: { audioUrl: true },
    })
    expect(stored?.audioUrl).toBe('tracks/master/secret-key.wav')
  })

  it('GET /tracks/:id with invalid UUID should return 400', async () => {
    await request(app.getHttpServer()).get('/tracks/not-a-uuid').expect(400)
  })

  it('GET /tracks/liked should return 401 without auth', async () => {
    await request(app.getHttpServer()).get('/tracks/liked').expect(401)
  })

  it('no longer serves the artist upload route POST /tracks (#467)', async () => {
    await request(app.getHttpServer()).post('/tracks').expect(404)
  })

  it('POST /tracks/:id/play-sessions should return 401 without auth', async () => {
    await request(app.getHttpServer())
      .post('/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479/play-sessions')
      .expect(401)
  })

  it('GET /tracks/:id/cmaf/:bitrate should return 403 without a playback session token', async () => {
    await request(app.getHttpServer())
      .get('/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479/cmaf/192')
      .expect(403)
  })

  it('GET /tracks/:id/cmaf/:bitrate should return 403 for a forged playback session token', async () => {
    await request(app.getHttpServer())
      .get('/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479/cmaf/192')
      .query({ t: 'forged.token' })
      .expect(403)
  })

  it('no longer serves the artist edit route PUT /tracks/:id (#467)', async () => {
    await request(app.getHttpServer())
      .put('/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479')
      .field('title', 'Updated Title')
      .expect(404)
  })

  it('GET /tracks/liked should return 200 for authenticated user', async () => {
    const { cookies } = await registerAndLogin(app, 'user')

    const res = await request(app.getHttpServer())
      .get('/tracks/liked')
      .set('Cookie', cookies)
      .expect(200)

    expect(res.body).toMatchObject({
      data: expect.any(Array),
      total: expect.any(Number),
      page: 1,
      limit: 10,
    })
  })
})
