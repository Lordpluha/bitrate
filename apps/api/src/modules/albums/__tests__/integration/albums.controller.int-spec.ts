import { appConfigs } from '@common/config'
import { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import { AlbumsModule } from '@modules/albums/albums.module'
import { ArtistsModule } from '@modules/artists/artists.module'
import { ArtistsAuthModule } from '@modules/artists-auth/artists-auth.module'
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
    ArtistsModule,
    ArtistsAuthModule,
    AlbumsModule,
  ],
})
class AlbumsIntegrationModule {}

describe('AlbumsController (integration)', () => {
  let app: INestApplication<App>
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AlbumsIntegrationModule],
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

  it('full user scenario: register -> login -> create -> read -> update -> delete', async () => {
    const registration = {
      email: 'artist@example.com',
      password: 'password123',
      username: 'artist',
    }

    await request(app.getHttpServer())
      .post('/artists/auth/registration')
      .send(registration)
      .expect(201)

    const loginResponse = await request(app.getHttpServer())
      .post('/artists/auth/login')
      .send({ email: registration.email, password: registration.password })
      .expect(201)

    const cookies = loginResponse.headers['set-cookie']
    expect(cookies).toBeDefined()
    if (!cookies) throw new Error('Auth cookies were not set')

    const createResponse = await request(app.getHttpServer())
      .post('/albums')
      .set('Cookie', cookies)
      .send({ title: 'Album title', description: 'desc' })
      .expect(201)

    const albumId = createResponse.body.id as string

    await request(app.getHttpServer()).get('/albums').query({ page: 1, limit: 10 }).expect(200)

    await request(app.getHttpServer()).get(`/albums/${albumId}`).expect(200)

    await request(app.getHttpServer())
      .put(`/albums/${albumId}`)
      .set('Cookie', cookies)
      .send({ title: 'Updated Album' })
      .expect(200)

    await request(app.getHttpServer())
      .delete(`/albums/${albumId}`)
      .set('Cookie', cookies)
      .expect(200)
  })

  it('GET /albums should support title filter', async () => {
    const artist = await prisma.artist.create({
      data: {
        username: 'artist2',
        email: 'artist2@example.com',
        password: 'password123',
      },
    })

    await prisma.album.create({
      data: {
        title: 'Rock Album',
        artistId: artist.id,
        description: null,
        cover: 'cover.png',
      },
    })

    const response = await request(app.getHttpServer())
      .get('/albums')
      .query({ title: 'rock', page: 1, limit: 10 })
      .expect(200)

    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toMatchObject({
      title: 'Rock Album',
    })
  })

  it('GET /albums should filter case-insensitively', async () => {
    const artist = await prisma.artist.create({
      data: {
        username: 'artistCase',
        email: 'artistCase@example.com',
        password: 'password123',
      },
    })

    await prisma.album.create({
      data: {
        title: 'RoCk Case',
        artistId: artist.id,
        description: null,
        cover: 'cover.png',
      },
    })

    const response = await request(app.getHttpServer())
      .get('/albums')
      .query({ title: 'rock', page: 1, limit: 10 })
      .expect(200)

    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toMatchObject({
      title: 'RoCk Case',
    })
  })

  it('GET /albums should accept pagination boundaries', async () => {
    await request(app.getHttpServer()).get('/albums').query({ page: 1, limit: 1 }).expect(200)
  })

  it('GET /albums should reject invalid pagination', async () => {
    await request(app.getHttpServer()).get('/albums').query({ page: 'nope' }).expect(400)
  })

  it('GET /albums/:id should reject invalid uuid', async () => {
    await request(app.getHttpServer()).get('/albums/not-uuid').expect(400)
  })

  it('GET /albums/:id should return empty body for missing album', async () => {
    const response = await request(app.getHttpServer())
      .get('/albums/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
      .expect(200)

    expect(response.body).toEqual({})
  })

  it('PUT /albums/:id should return 404 for missing album', async () => {
    const registration = {
      email: 'artist6@example.com',
      password: 'password123',
      username: 'artist6',
    }

    await request(app.getHttpServer())
      .post('/artists/auth/registration')
      .send(registration)
      .expect(201)

    const loginResponse = await request(app.getHttpServer())
      .post('/artists/auth/login')
      .send({ email: registration.email, password: registration.password })
      .expect(201)

    const cookies = loginResponse.headers['set-cookie']
    expect(cookies).toBeDefined()
    if (!cookies) throw new Error('Auth cookies were not set')

    await request(app.getHttpServer())
      .put('/albums/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
      .set('Cookie', cookies)
      .send({ title: 'Updated Album' })
      .expect(404)
  })

  it('POST /albums should reject without auth', async () => {
    await request(app.getHttpServer()).post('/albums').send({ title: 'No Auth' }).expect(401)
  })

  it('PUT /albums/:id should reject without auth', async () => {
    const artist = await prisma.artist.create({
      data: {
        username: 'artist4',
        email: 'artist4@example.com',
        password: 'password123',
      },
    })

    const album = await prisma.album.create({
      data: {
        title: 'Locked Album',
        artistId: artist.id,
        description: null,
      },
    })

    await request(app.getHttpServer())
      .put(`/albums/${album.id}`)
      .send({ title: 'Should Fail' })
      .expect(401)
  })

  it('DELETE /albums/:id should reject without auth', async () => {
    const artist = await prisma.artist.create({
      data: {
        username: 'artist5',
        email: 'artist5@example.com',
        password: 'password123',
      },
    })

    const album = await prisma.album.create({
      data: {
        title: 'Locked Album',
        artistId: artist.id,
        description: null,
      },
    })

    await request(app.getHttpServer()).delete(`/albums/${album.id}`).expect(401)
  })

  it('should validate album creation payload', async () => {
    const registration = {
      email: 'artist2@example.com',
      password: 'password123',
      username: 'artist2',
    }

    await request(app.getHttpServer())
      .post('/artists/auth/registration')
      .send(registration)
      .expect(201)

    const loginResponse = await request(app.getHttpServer())
      .post('/artists/auth/login')
      .send({ email: registration.email, password: registration.password })
      .expect(201)

    const cookies = loginResponse.headers['set-cookie']
    expect(cookies).toBeDefined()
    if (!cookies) throw new Error('Auth cookies were not set')

    await request(app.getHttpServer())
      .post('/albums')
      .set('Cookie', cookies)
      .send({ description: 'missing title' })
      .expect(400)
  })

  it('should reject login with wrong password', async () => {
    await request(app.getHttpServer())
      .post('/artists/auth/registration')
      .send({
        email: 'artist3@example.com',
        password: 'password123',
        username: 'artist3',
      })
      .expect(201)

    await request(app.getHttpServer())
      .post('/artists/auth/login')
      .send({ email: 'artist3@example.com', password: 'wrongpass' })
      .expect(401)
  })
})
