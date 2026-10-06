import { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { verifyUserEmail } from '../helpers/db'
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
      acceptLegal: true,
    }

    await request(app.getHttpServer()).post('/auth/registration').send(registration).expect(201)
    await verifyUserEmail(app.get(PrismaService), registration.email)

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

  it('uploads an avatar to the object store and serves it back at the stored /static URL', async () => {
    const runId = makeRunId()
    const registration = {
      email: `avatar_${runId}@example.com`,
      password: 'password123',
      username: `avatar_${runId}`,
      acceptLegal: true,
    }
    await request(app.getHttpServer()).post('/auth/registration').send(registration).expect(201)
    await verifyUserEmail(app.get(PrismaService), registration.email)
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: registration.email, password: registration.password })
      .expect(201)
    const cookies = login.headers['set-cookie']
    if (!cookies) throw new Error('Auth cookies were not set')

    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d])
    const upload = await request(app.getHttpServer())
      .post('/users/avatar')
      .set('Cookie', cookies)
      .attach('avatar', png, { filename: 'me.png', contentType: 'image/png' })
      .expect(201)

    expect(upload.body.avatar).toMatch(/^\/static\/users\/avatars\/[0-9a-f-]{36}\.png$/)
    const served = await request(app.getHttpServer())
      .get(upload.body.avatar)
      .buffer(true)
      .parse((res, callback) => {
        const chunks: Buffer[] = []
        res.on('data', (chunk: Buffer) => chunks.push(chunk))
        res.on('end', () => callback(null, Buffer.concat(chunks)))
      })
      .expect(200)
    expect(served.headers['content-type']).toBe('image/png')
    expect(served.body).toEqual(png)

    await request(app.getHttpServer())
      .post('/users/avatar')
      .set('Cookie', cookies)
      .attach('avatar', Buffer.from('<script>x</script>'), {
        filename: 'evil.png',
        contentType: 'image/png',
      })
      .expect(400)
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
      acceptLegal: true,
    }

    await request(app.getHttpServer()).post('/auth/registration').send(registration).expect(201)
    await verifyUserEmail(app.get(PrismaService), registration.email)

    const res = await request(app.getHttpServer())
      .get('/users')
      .query({ username: `user_${runId}`, limit: 10, page: 1 })
      .expect(200)

    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.some((u: { username: string }) => u.username === `user_${runId}`)).toBe(
      true,
    )
  })

  it('GET /users without username should return 400', async () => {
    await request(app.getHttpServer()).get('/users').query({ limit: 10, page: 1 }).expect(400)
  })

  it('POST /users/avatar should return 401 without auth', async () => {
    await request(app.getHttpServer())
      .post('/users/avatar')
      .attach('avatar', Buffer.from('fake'), { filename: 'test.jpg', contentType: 'image/jpeg' })
      .expect(401)
  })
})
