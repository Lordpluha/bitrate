import type { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { resetUsersDatabase } from '../helpers/db'
import { closeE2eApp, createE2eApp } from './e2e-app'

const makeRunId = () => Math.random().toString(36).slice(2, 8)

describe('UsersAuth (e2e)', () => {
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

  it('full user auth scenario: register -> login -> me -> refresh -> logout', async () => {
    const runId = makeRunId()
    const creds = {
      email: `user_${runId}@example.com`,
      password: 'password123',
      username: `user_${runId}`,
    }

    await request(app.getHttpServer()).post('/auth/registration').send(creds).expect(201)

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: creds.email, password: creds.password })
      .expect(201)

    const cookies = loginRes.headers['set-cookie'] as unknown as string[]
    expect(cookies).toBeDefined()
    if (!cookies) throw new Error('Auth cookies were not set')

    const meRes = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', cookies)
      .expect(200)

    expect(meRes.body).toMatchObject({ username: creds.username })

    await request(app.getHttpServer()).post('/auth/logout').set('Cookie', cookies).expect(201)
  })

  it('POST /auth/registration should reject duplicate email', async () => {
    const runId = makeRunId()
    const creds = {
      email: `dup_${runId}@example.com`,
      password: 'pass123',
      username: `dup_${runId}`,
    }

    await request(app.getHttpServer()).post('/auth/registration').send(creds).expect(201)
    await request(app.getHttpServer()).post('/auth/registration').send(creds).expect(409)
  })

  it('POST /auth/login should return 401 with wrong credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'notfound@example.com', password: 'wrong' })
      .expect(401)
  })

  it('GET /auth/me should return 401 without auth cookies', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401)
  })

  it('POST /auth/registration should reject invalid body', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({ email: 'not-an-email', password: '123', username: '' })
      .expect(400)
  })
})
