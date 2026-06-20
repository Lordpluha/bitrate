import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { UserAuthGuard } from '@modules/users-auth/users-auth.guard'
import type { INestApplication } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import request from 'supertest'
import {
  buildPlaylist,
  buildPlaylistWithTracks,
  buildPlaylistWithUser,
  buildUser,
} from './__tests__/fixtures/playlists.fixtures'
import { PlaylistsController } from './playlists.controller'
import { PlaylistsService } from './playlists.service'

const makeServiceMock = () =>
  ({
    getAll: jest.fn(),
    getByIdPopulated: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  }) as unknown as jest.Mocked<PlaylistsService>

describe('PlaylistsController (int)', () => {
  let app: INestApplication
  let service: jest.Mocked<PlaylistsService>
  const user = buildUser()

  beforeAll(async () => {
    service = makeServiceMock()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaylistsController],
      providers: [{ provide: PlaylistsService, useValue: service }],
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
    service.getAll.mockReset()
    service.getByIdPopulated.mockReset()
    service.create.mockReset()
    service.update.mockReset()
  })

  it('GET /playlists should return 200 with playlists', async () => {
    service.getAll.mockResolvedValue([buildPlaylistWithUser()] as never)

    const res = await request(app.getHttpServer()).get('/playlists')

    expect(res.status).toBe(200)
    expect(service.getAll).toHaveBeenCalled()
  })

  it('GET /playlists/:id with valid UUID should return 200', async () => {
    service.getByIdPopulated.mockResolvedValue(buildPlaylistWithTracks() as never)

    const res = await request(app.getHttpServer()).get(
      '/playlists/f47ac10b-58cc-4372-a567-0e02b2c3d479',
    )

    expect(res.status).toBe(200)
    expect(service.getByIdPopulated).toHaveBeenCalledWith('f47ac10b-58cc-4372-a567-0e02b2c3d479')
  })

  it('GET /playlists/:id with invalid UUID should return 400', async () => {
    const res = await request(app.getHttpServer()).get('/playlists/not-a-uuid')

    expect(res.status).toBe(400)
  })

  it('POST /playlists should return 201 with created playlist', async () => {
    service.create.mockResolvedValue(buildPlaylist() as never)

    const res = await request(app.getHttpServer())
      .post('/playlists')
      .send({ title: 'My Playlist', isPublic: true, description: null })

    expect(res.status).toBe(201)
    expect(service.create).toHaveBeenCalledWith(
      user.id,
      expect.objectContaining({ title: 'My Playlist' }),
    )
  })

  it('PUT /playlists/:id should return 200 with updated playlist', async () => {
    service.update.mockResolvedValue(buildPlaylist({ title: 'Updated' }) as never)

    const res = await request(app.getHttpServer())
      .put('/playlists/f47ac10b-58cc-4372-a567-0e02b2c3d479')
      .send({ title: 'Updated' })

    expect(res.status).toBe(200)
    expect(service.update).toHaveBeenCalledWith(
      user.id,
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      expect.any(Object),
    )
  })
})
