import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { OptionalUserAuthGuard, UserAuthGuard } from '@modules/users-auth/users-auth.guard'
import type { INestApplication } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { buildUser } from './__tests__/fixtures/users.fixtures'
import { UserFollowsService } from './user-follows.service'
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

const makeFollowsMock = () =>
  ({
    listFollows: jest.fn(),
    getFollowingActivity: jest.fn(),
    getFollowing: jest.fn(),
  }) as unknown as jest.Mocked<UserFollowsService>

describe('UsersController (int)', () => {
  let app: INestApplication
  let service: jest.Mocked<UsersService>
  let follows: jest.Mocked<UserFollowsService>
  const user = buildUser()

  beforeAll(async () => {
    service = makeServiceMock()
    follows = makeFollowsMock()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: service },
        { provide: UserFollowsService, useValue: follows },
      ],
    })
      .overrideGuard(OptionalUserAuthGuard)
      .useValue({
        canActivate: (ctx: {
          switchToHttp: () => { getRequest: () => Record<string, unknown> }
        }) => {
          ctx.switchToHttp().getRequest().user = user
          return true
        },
      })
      .overrideGuard(UserAuthGuard)
      .useValue({
        canActivate: (ctx: {
          switchToHttp: () => { getRequest: () => Record<string, unknown> }
        }) => {
          ctx.switchToHttp().getRequest().user = user
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
    follows.listFollows.mockReset()
    follows.getFollowingActivity.mockReset()
    follows.getFollowing.mockReset()
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

  it('GET /users without username should return 400', async () => {
    const res = await request(app.getHttpServer()).get('/users').query({ limit: 10, page: 1 })

    // A missing required query parameter is a client error; this used to fall
    // through as an unhandled 500.
    expect(res.status).toBe(400)
  })

  it('POST /users/avatar should hand the uploaded file to uploadAvatar and return 201', async () => {
    service.uploadAvatar.mockResolvedValue(user as never)
    const pngBytes = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    ])

    const res = await request(app.getHttpServer())
      .post('/users/avatar')
      .attach('avatar', pngBytes, {
        filename: 'test.png',
        contentType: 'image/png',
      })

    expect(res.status).toBe(201)
    expect(service.uploadAvatar).toHaveBeenCalledWith(
      user.id,
      expect.objectContaining({ buffer: pngBytes, mimetype: 'image/png' }),
    )
  })

  it('POST /users/avatar rejects a disallowed type before reaching the service', async () => {
    const res = await request(app.getHttpServer())
      .post('/users/avatar')
      .attach('avatar', Buffer.from('<script>alert(1)</script>'), {
        filename: 'evil.html',
        contentType: 'text/html',
      })

    expect(res.status).toBe(400)
    expect(service.uploadAvatar).not.toHaveBeenCalled()
  })

  const friendId = '0199d0c1-6c2a-7b3e-9a4f-1c2d3e4f5a6b'

  it('GET /users/me/following/activity should return the caller friend activity', async () => {
    follows.getFollowingActivity.mockResolvedValue([] as never)

    const res = await request(app.getHttpServer())
      .get('/users/me/following/activity')
      .query({ limit: 5 })

    expect(res.status).toBe(200)
    expect(follows.getFollowingActivity).toHaveBeenCalledWith(user.id, 5)
    expect(follows.listFollows).not.toHaveBeenCalled()
  })

  it('GET /users/me/following should still list the caller follows, not parse me as an id', async () => {
    follows.getFollowing.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as never)

    const res = await request(app.getHttpServer()).get('/users/me/following')

    expect(res.status).toBe(200)
    expect(follows.getFollowing).toHaveBeenCalled()
    expect(follows.listFollows).not.toHaveBeenCalled()
  })

  it('GET /users/:id/followers should pass the viewer through', async () => {
    follows.listFollows.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as never)

    const res = await request(app.getHttpServer()).get(`/users/${friendId}/followers`)

    expect(res.status).toBe(200)
    expect(follows.listFollows).toHaveBeenCalledWith(
      'followers',
      friendId,
      user.id,
      undefined,
      undefined,
    )
  })

  it('GET /users/:id/following should reject an id that is not a UUID', async () => {
    const res = await request(app.getHttpServer()).get('/users/nope/following')

    expect(res.status).toBe(400)
    expect(follows.listFollows).not.toHaveBeenCalled()
  })
})
