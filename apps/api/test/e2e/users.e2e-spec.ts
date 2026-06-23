import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { closeE2eApp, createE2eApp } from './e2e-app'

const makeRunId = () => Math.random().toString(36).slice(2, 8)

describe('UsersController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const setup = await createE2eApp()
    app = setup.app
  })

  afterAll(async () => {
    await closeE2eApp(app)
  })

  it('full user scenario: register -> login -> me -> update -> getByUsername', async () => {
    const runId = makeRunId()
    const registration = {
      email: `user_${runId}@example.com`,
      password: 'password123',
      username: `user_${runId}`,
    }

    await request(app.getHttpServer()).post('/auth/registration').send(registration).expect(201)

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: registration.email, password: registration.password })
      .expect(201)

    const cookies = loginResponse.headers['set-cookie']
    expect(cookies).toBeDefined()
    if (!cookies) throw new Error('Auth cookies were not set')

    await request(app.getHttpServer()).get('/auth/me').set('Cookie', cookies).expect(200)

    await request(app.getHttpServer())
      .put('/users')
      .set('Cookie', cookies)
      .send({
        username: `user_${runId}_2`,
        email: `user_${runId}_2@example.com`,
        description: 'about',
      })
      .expect(200)

    const getByUsername = await request(app.getHttpServer())
      .get(`/users/username/user_${runId}_2`)
      .expect(200)

    expect(getByUsername.body).toMatchObject({
      username: `user_${runId}_2`,
    })
  })

  it('PUT /users should reject without auth', async () => {
    await request(app.getHttpServer())
      .put('/users')
      .send({ username: 'user2', email: 'user2@example.com' })
      .expect(401)
  })

  it('GET /users?username=... should return matching users', async () => {
    const runId = makeRunId()
    const registration = {
      email: `user_${runId}@example.com`,
      password: 'password123',
      username: `user_${runId}`,
    }

    await request(app.getHttpServer()).post('/auth/registration').send(registration).expect(201)

    const res = await request(app.getHttpServer())
      .get('/users')
      .query({ username: `user_${runId}`, limit: 10, page: 1 })
      .expect(200)

    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.some((u: { username: string }) => u.username === `user_${runId}`)).toBe(true)
  })

  it('GET /users without username should return 500', async () => {
    await request(app.getHttpServer()).get('/users').query({ limit: 10, page: 1 }).expect(500)
  })

  it('POST /users/avatar should return 401 without auth', async () => {
    await request(app.getHttpServer())
      .post('/users/avatar')
      .attach('avatar', Buffer.from('fake'), { filename: 'test.jpg', contentType: 'image/jpeg' })
      .expect(401)
  })
})
