import { appConfigs } from '@common/config'
import { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import { PlaylistsModule } from '@modules/playlists/playlists.module'
import { UsersModule } from '@modules/users/users.module'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { INestApplication, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { resetDatabase } from '@test/helpers'
import * as cookieParser from 'cookie-parser'
import * as request from 'supertest'
import { App } from 'supertest/types'
import { envSchema } from '../../../../../env.schema'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.test',
      load: appConfigs,
      validate: (env) => envSchema.parse(env),
    }),
    UsersModule,
    UsersAuthModule,
    PlaylistsModule,
  ],
})
class PlaylistsIntegrationModule {}

describe('PlaylistsController (integration)', () => {
  let app: INestApplication<App>
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PlaylistsIntegrationModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.use(cookieParser())
    await app.init()

    prisma = app.get(PrismaService)
  })

  beforeEach(async () => {
    await resetDatabase(prisma)
  })

  afterAll(async () => {
    await resetDatabase(prisma)
    await app.close()
  })

  it('full user scenario: register -> login -> create -> read -> update', async () => {
    const registration = {
      email: 'user@example.com',
      password: 'password123',
      username: 'user',
    }

    await request(app.getHttpServer()).post('/auth/registration').send(registration).expect(201)

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: registration.email, password: registration.password })
      .expect(201)

    const cookies = loginResponse.headers['set-cookie']
    expect(cookies).toBeDefined()
    if (!cookies) throw new Error('Auth cookies were not set')

    const createResponse = await request(app.getHttpServer())
      .post('/playlists')
      .set('Cookie', cookies)
      .send({ title: 'My Playlist', description: 'desc' })
      .expect(201)

    const playlistId = createResponse.body.id as string

    await request(app.getHttpServer()).get('/playlists').query({ page: 1, limit: 10 }).expect(200)

    await request(app.getHttpServer()).get(`/playlists/${playlistId}`).expect(200)

    await request(app.getHttpServer())
      .put(`/playlists/${playlistId}`)
      .set('Cookie', cookies)
      .send({ title: 'Updated Playlist' })
      .expect(200)
  })

  it('GET /playlists should return list', async () => {
    const user = await prisma.user.create({
      data: {
        username: 'user2',
        email: 'user2@example.com',
        password: 'password123',
      },
    })

    await prisma.playlist.create({
      data: {
        title: 'Chill Mix',
        userId: user.id,
        description: null,
        cover: 'cover.png',
      },
    })

    const response = await request(app.getHttpServer())
      .get('/playlists')
      .query({ page: 1, limit: 10 })
      .expect(200)

    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toMatchObject({
      title: 'Chill Mix',
      user: { id: user.id, username: 'user2' },
    })
  })

  it('GET /playlists/:id should reject invalid uuid', async () => {
    await request(app.getHttpServer()).get('/playlists/not-uuid').expect(400)
  })

  it('POST /playlists should reject without auth', async () => {
    await request(app.getHttpServer()).post('/playlists').send({ title: 'No Auth' }).expect(401)
  })

  it('PUT /playlists/:id should reject without auth', async () => {
    const user = await prisma.user.create({
      data: {
        username: 'user3',
        email: 'user3@example.com',
        password: 'password123',
      },
    })

    const playlist = await prisma.playlist.create({
      data: {
        title: 'Locked Playlist',
        userId: user.id,
        description: null,
      },
    })

    await request(app.getHttpServer())
      .put(`/playlists/${playlist.id}`)
      .send({ title: 'Should Fail' })
      .expect(401)
  })

  it('should validate playlist creation payload', async () => {
    const registration = {
      email: 'user4@example.com',
      password: 'password123',
      username: 'user4',
    }

    await request(app.getHttpServer()).post('/auth/registration').send(registration).expect(201)

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: registration.email, password: registration.password })
      .expect(201)

    const cookies = loginResponse.headers['set-cookie']
    expect(cookies).toBeDefined()
    if (!cookies) throw new Error('Auth cookies were not set')

    await request(app.getHttpServer())
      .post('/playlists')
      .set('Cookie', cookies)
      .send({ description: 'missing title' })
      .expect(400)
  })
})
