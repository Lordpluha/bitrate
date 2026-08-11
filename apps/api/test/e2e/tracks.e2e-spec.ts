import type { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { resetArtistsDatabase, resetUsersDatabase } from '../helpers/db'
import { closeE2eApp, createE2eApp, getResponseCookies } from './e2e-app'

const makeRunId = () => Math.random().toString(36).slice(2, 8)

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

  it('GET /tracks/:id with invalid UUID should return 400', async () => {
    await request(app.getHttpServer()).get('/tracks/not-a-uuid').expect(400)
  })

  it('GET /tracks/liked should return 401 without auth', async () => {
    await request(app.getHttpServer()).get('/tracks/liked').expect(401)
  })

  it('POST /tracks should return 401 without artist auth', async () => {
    await request(app.getHttpServer()).post('/tracks').expect(401)
  })

  it('GET /tracks/stream/:id should return 401 without auth', async () => {
    await request(app.getHttpServer())
      .get('/tracks/stream/f47ac10b-58cc-4372-a567-0e02b2c3d479')
      .expect(401)
  })

  it('PUT /tracks/:id should return 401 without artist auth', async () => {
    await request(app.getHttpServer())
      .put('/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479')
      .field('title', 'Updated Title')
      .expect(401)
  })

  it('GET /tracks/liked should return 200 for authenticated user', async () => {
    const runId = makeRunId()
    const creds = {
      email: `user_${runId}@example.com`,
      password: 'password123',
      username: `user_${runId}`,
    }
    await request(app.getHttpServer()).post('/auth/registration').send(creds).expect(201)
    await prisma.user.update({
      where: { email: creds.email },
      data: { emailVerifiedAt: new Date() },
    })
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: creds.email, password: creds.password })
      .expect(201)
    const cookies = getResponseCookies(loginRes.headers['set-cookie'])

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
