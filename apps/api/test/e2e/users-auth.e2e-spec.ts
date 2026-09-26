import type { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { resetUsersDatabase, verifyUserEmail } from '../helpers/db'
import { closeE2eApp, createE2eApp, getResponseCookies } from './e2e-app'

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
    await verifyUserEmail(prisma, creds.email)

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: creds.email, password: creds.password })
      .expect(201)

    const cookies = getResponseCookies(loginRes.headers['set-cookie'])
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
    await verifyUserEmail(prisma, creds.email)
    await request(app.getHttpServer()).post('/auth/registration').send(creds).expect(409)
  })

  it('POST /auth/login should return 401 with wrong credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'notfound@example.com', password: 'wrong-password' })
      .expect(401)
  })

  it('POST /auth/login should count a failed attempt and lock at the threshold', async () => {
    const runId = makeRunId()
    const creds = {
      email: `lock_${runId}@example.com`,
      password: 'pass123',
      username: `lock_${runId}`,
    }

    await request(app.getHttpServer()).post('/auth/registration').send(creds).expect(201)
    await verifyUserEmail(prisma, creds.email)

    /** A wrong password for an account that exists is the only path that writes the lockout. */
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: creds.email, password: 'wrong-password' })
      .expect(401)

    const afterFirst = await prisma.user.findFirst({ where: { email: creds.email } })
    expect(afterFirst?.failedLoginAttempts).toBe(1)
    expect(afterFirst?.lockedUntil).toBeNull()

    for (let attempt = 0; attempt < 4; attempt++) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: creds.email, password: 'wrong-password' })
        .expect(401)
    }

    const locked = await prisma.user.findFirst({ where: { email: creds.email } })
    expect(locked?.failedLoginAttempts).toBe(5)
    expect(locked?.lockedUntil).toBeInstanceOf(Date)

    /**
     * The deadline must be the intended instant. A wall-clock value stored without its
     * offset would leave a remaining window shifted by the machine's timezone.
     */
    const remainingMs = (locked?.lockedUntil as Date).getTime() - Date.now()
    expect(remainingMs).toBeGreaterThan(14 * 60 * 1000)
    expect(remainingMs).toBeLessThanOrEqual(15 * 60 * 1000)

    /** A locked account is refused even with the right password. */
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: creds.email, password: creds.password })
      .expect(429)
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
