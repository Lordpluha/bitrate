import { appConfigs } from '@common/config'
import { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import { UsersModule } from '@modules/users/users.module'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { INestApplication, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { resetUsersDatabase } from '@test/helpers'
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
  ],
})
class UsersIntegrationModule {}

describe('UsersController (integration)', () => {
  let app: INestApplication<App>
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersIntegrationModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.use(cookieParser())
    await app.init()

    prisma = app.get(PrismaService)
  })

  beforeEach(async () => {
    await resetUsersDatabase(prisma)
  })

  afterAll(async () => {
    await resetUsersDatabase(prisma)
    await app.close()
  })

  it('full user scenario: register -> login -> me -> update -> getByUsername', async () => {
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

    await request(app.getHttpServer()).get('/auth/me').set('Cookie', cookies).expect(200)

    await request(app.getHttpServer())
      .put('/users')
      .set('Cookie', cookies)
      .send({ username: 'user2', email: 'user2@example.com', description: 'about' })
      .expect(200)

    const getByUsername = await request(app.getHttpServer())
      .get('/users/username/user2')
      .expect(200)

    expect(getByUsername.body).toMatchObject({
      username: 'user2',
    })
  })

  it('PUT /users should reject without auth', async () => {
    await request(app.getHttpServer())
      .put('/users')
      .send({ username: 'user2', email: 'user2@example.com' })
      .expect(401)
  })
})
