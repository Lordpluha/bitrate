import * as fs from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { UserAuthGuard } from '@modules/users-auth/users-auth.guard'
import type { INestApplication } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { buildUser } from './__tests__/fixtures/users.fixtures'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findById: jest.fn(),
    getByUsername: jest.fn(),
    updateById: jest.fn(),
    uploadAvatar: jest.fn(),
  }) as unknown as jest.Mocked<UsersService>

describe('UsersController (int)', () => {
  let app: INestApplication
  let service: jest.Mocked<UsersService>
  const user = buildUser()

  beforeAll(async () => {
    fs.mkdirSync('./storage/public/users/avatars', { recursive: true })
    service = makeServiceMock()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: service }],
    })
      .overrideGuard(UserAuthGuard)
      .useValue({
        canActivate: (ctx: {
          switchToHttp: () => { getRequest: () => Record<string, unknown> }
        }) => {
          ctx.switchToHttp().getRequest()['user'] = user
          return true
        },
      })
      .compile()

    app = module.createNestApplication()
    await app.init()
  })

  afterAll(() => app.close())

  beforeEach(() => {
    service.findAll.mockReset()
    service.findById.mockReset()
    service.getByUsername.mockReset()
    service.updateById.mockReset()
    service.uploadAvatar.mockReset()
  })

  it('GET /users/username/:username should return 200', async () => {
    service.getByUsername.mockResolvedValue(user as never)

    const res = await request(app.getHttpServer()).get('/users/username/user')

    expect(res.status).toBe(200)
    expect(service.getByUsername).toHaveBeenCalledWith('user')
  })

  it('GET /users/:id with valid UUID should return 200', async () => {
    service.findById.mockResolvedValue(user as never)

    const res = await request(app.getHttpServer()).get(
      '/users/f47ac10b-58cc-4372-a567-0e02b2c3d479',
    )

    expect(res.status).toBe(200)
    expect(service.findById).toHaveBeenCalledWith('f47ac10b-58cc-4372-a567-0e02b2c3d479')
  })

  it('GET /users/:id with invalid UUID should return 400', async () => {
    const res = await request(app.getHttpServer()).get('/users/not-a-uuid')

    expect(res.status).toBe(400)
  })

  it('PUT /users should return 200 with updated user', async () => {
    service.updateById.mockResolvedValue(user as never)

    const res = await request(app.getHttpServer()).put('/users').send({ username: 'updated' })

    expect(res.status).toBe(200)
    expect(service.updateById).toHaveBeenCalledWith(
      user.id,
      expect.objectContaining({ username: 'updated' }),
    )
  })

  it('GET /users?username=... should return 200 and call findAll', async () => {
    service.findAll.mockResolvedValue([user] as never)

    const res = await request(app.getHttpServer())
      .get('/users')
      .query({ username: 'user', limit: 10, page: 1 })

    expect(res.status).toBe(200)
    expect(service.findAll).toHaveBeenCalledWith({ username: 'user', limit: 10, page: 1 })
  })

  it('GET /users without username should return 500', async () => {
    const res = await request(app.getHttpServer()).get('/users').query({ limit: 10, page: 1 })

    expect(res.status).toBe(500)
  })

  it('POST /users/avatar should call uploadAvatar and return 201', async () => {
    service.uploadAvatar.mockResolvedValue(user as never)

    const res = await request(app.getHttpServer())
      .post('/users/avatar')
      .attach('avatar', Buffer.from('fake-image'), {
        filename: 'test.png',
        contentType: 'image/png',
      })

    expect(res.status).toBe(201)
    expect(service.uploadAvatar).toHaveBeenCalledWith(user.id, expect.any(String))
  })
})
