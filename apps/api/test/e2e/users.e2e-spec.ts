import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
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
})
