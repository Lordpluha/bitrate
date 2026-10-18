import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ArtistAuthGuard } from '@modules/artists-auth/artists-auth.guard'
import { UserAuthGuard } from '@modules/users-auth/users-auth.guard'
import type { INestApplication } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { buildAlbum, buildArtist } from './__tests__/fixtures/albums.fixtures'
import { AlbumsController } from './albums.controller'
import { AlbumsService } from './albums.service'

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findLiked: jest.fn(),
    findForTracks: jest.fn(),
  }) as unknown as jest.Mocked<AlbumsService>

describe('AlbumsController (int)', () => {
  let app: INestApplication
  let service: jest.Mocked<AlbumsService>
  const artist = buildArtist()

  beforeAll(async () => {
    service = makeServiceMock()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlbumsController],
      providers: [{ provide: AlbumsService, useValue: service }],
    })
      .overrideGuard(UserAuthGuard)
      .useValue({
        canActivate: (ctx: {
          switchToHttp: () => { getRequest: () => Record<string, unknown> }
        }) => {
          ctx.switchToHttp().getRequest().user = { id: 'user-1', username: 'user' }
          return true
        },
      })
      .overrideGuard(ArtistAuthGuard)
      .useValue({
        canActivate: (ctx: {
          switchToHttp: () => { getRequest: () => Record<string, unknown> }
        }) => {
          ctx.switchToHttp().getRequest().artist = artist
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
    service.getById.mockReset()
    service.create.mockReset()
    service.update.mockReset()
    service.delete.mockReset()
    service.findLiked.mockReset()
  })

  it('GET /albums should return 200 with albums list', async () => {
    service.findAll.mockResolvedValue([buildAlbum()] as never)

    const res = await request(app.getHttpServer()).get('/albums').query({ page: 1, limit: 10 })

    expect(res.status).toBe(200)
    expect(service.findAll).toHaveBeenCalled()
  })

  it('GET /albums/:id with valid UUID should return 200', async () => {
    const album = buildAlbum({ id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
    service.getById.mockResolvedValue(album as never)

    const res = await request(app.getHttpServer()).get(
      '/albums/f47ac10b-58cc-4372-a567-0e02b2c3d479',
    )

    expect(res.status).toBe(200)
    expect(service.getById).toHaveBeenCalledWith('f47ac10b-58cc-4372-a567-0e02b2c3d479')
  })

  it('GET /albums/:id with invalid UUID should return 400', async () => {
    const res = await request(app.getHttpServer()).get('/albums/not-a-uuid')

    expect(res.status).toBe(400)
  })

  it('POST /albums should return 201 with created album', async () => {
    const album = buildAlbum()
    service.create.mockResolvedValue(album as never)

    const res = await request(app.getHttpServer())
      .post('/albums')
      .send({ title: 'New Album', rightsConfirmed: true })

    expect(res.status).toBe(201)
    expect(service.create).toHaveBeenCalledWith(
      artist.id,
      expect.objectContaining({ title: 'New Album' }),
    )
  })

  it('PUT /albums/:id should return 200 with updated album', async () => {
    const album = buildAlbum({ id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', title: 'Updated' })
    service.update.mockResolvedValue(album as never)

    const res = await request(app.getHttpServer())
      .put('/albums/f47ac10b-58cc-4372-a567-0e02b2c3d479')
      .send({ title: 'Updated' })

    expect(res.status).toBe(200)
    expect(service.update).toHaveBeenCalledWith(
      artist.id,
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      expect.any(Object),
    )
  })

  it('DELETE /albums/:id should return 200', async () => {
    const album = buildAlbum({ id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
    service.delete.mockResolvedValue(album as never)

    const res = await request(app.getHttpServer()).delete(
      '/albums/f47ac10b-58cc-4372-a567-0e02b2c3d479',
    )

    expect(res.status).toBe(200)
    expect(service.delete).toHaveBeenCalledWith(artist.id, 'f47ac10b-58cc-4372-a567-0e02b2c3d479')
  })

  it('GET /albums/liked should list the signed-in user saved albums, not parse liked as an id', async () => {
    service.findLiked.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as never)

    const res = await request(app.getHttpServer())
      .get('/albums/liked')
      .query({ page: 1, limit: 20 })

    expect(res.status).toBe(200)
    expect(service.findLiked).toHaveBeenCalledWith('user-1', { page: 1, limit: 20 })
    expect(service.getById).not.toHaveBeenCalled()
  })

  describe('GET /albums/by-tracks', () => {
    const A = '01a10c5c-0000-7000-8000-00000000000a'
    const B = '01a10c5c-0000-7000-8000-00000000000b'

    beforeEach(() => {
      service.findForTracks.mockReset()
      service.getById.mockReset()
    })

    it('answers the albums of a comma-separated track list, not parse by-tracks as an id', async () => {
      const body = {
        data: [
          { trackId: A, album: { id: 'album-1', title: 'Glass Cities' } },
          { trackId: B, album: null },
        ],
      }
      service.findForTracks.mockResolvedValue(body as never)

      const res = await request(app.getHttpServer()).get(`/albums/by-tracks?trackIds=${A},${B}`)

      expect(res.status).toBe(200)
      expect(res.body).toEqual(body)
      expect(service.findForTracks).toHaveBeenCalledWith([A, B])
      expect(service.getById).not.toHaveBeenCalled()
    })

    it('refuses a missing, malformed or oversized list', async () => {
      const tooMany = Array.from({ length: 101 }, () => A).join(',')
      for (const query of ['', '?trackIds=', '?trackIds=not-a-uuid', `?trackIds=${tooMany}`]) {
        const res = await request(app.getHttpServer()).get(`/albums/by-tracks${query}`)
        expect(res.status).toBe(400)
      }
      expect(service.findForTracks).not.toHaveBeenCalled()
    })
  })
})
