import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ArtistAuthGuard } from '@modules/artists-auth/artists-auth.guard'
import { UserAuthGuard } from '@modules/users-auth/users-auth.guard'
import { type INestApplication, NotFoundException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { buildArtist } from './__tests__/fixtures/artists.fixtures'
import { ArtistsController } from './artists.controller'
import { ArtistsService } from './artists.service'
import { ARTIST_ERRORS } from './errors/artist.errors'
import { FollowedArtistsController } from './followed-artists.controller'

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findById: jest.fn(),
    findTopTracks: jest.fn(),
    findPlaylists: jest.fn(),
    findByUsername: jest.fn(),
    requestDelete: jest.fn(),
    getFollowing: jest.fn(),
  }) as unknown as jest.Mocked<ArtistsService>

describe('ArtistsController (int)', () => {
  let app: INestApplication
  let service: jest.Mocked<ArtistsService>
  const artist = buildArtist()

  beforeAll(async () => {
    service = makeServiceMock()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtistsController, FollowedArtistsController],
      providers: [{ provide: ArtistsService, useValue: service }],
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
    service.findById.mockReset()
    service.findTopTracks.mockReset()
    service.findPlaylists.mockReset()
    service.findByUsername.mockReset()
    service.getFollowing.mockReset()
    service.requestDelete.mockReset()
  })

  it('GET /artists should return 200 with artists list', async () => {
    service.findAll.mockResolvedValue([artist] as never)

    const res = await request(app.getHttpServer()).get('/artists').query({ page: 1, limit: 10 })

    expect(res.status).toBe(200)
    expect(service.findAll).toHaveBeenCalled()
  })

  it('GET /artists/:id with valid UUID should return 200', async () => {
    service.findById.mockResolvedValue(artist as never)

    const res = await request(app.getHttpServer()).get(
      '/artists/f47ac10b-58cc-4372-a567-0e02b2c3d479',
    )

    expect(res.status).toBe(200)
    expect(service.findById).toHaveBeenCalledWith('f47ac10b-58cc-4372-a567-0e02b2c3d479')
  })

  it('GET /artists/:id with invalid UUID should return 400', async () => {
    const res = await request(app.getHttpServer()).get('/artists/not-a-uuid')

    expect(res.status).toBe(400)
  })

  it('GET /artists/username/:username should return 200', async () => {
    service.findByUsername.mockResolvedValue(artist as never)

    const res = await request(app.getHttpServer()).get('/artists/username/artist')

    expect(res.status).toBe(200)
    expect(service.findByUsername).toHaveBeenCalledWith('artist')
  })

  it('GET /artists/username/:username should return 404 for an unknown username', async () => {
    service.findByUsername.mockRejectedValue(new NotFoundException(ARTIST_ERRORS.NOT_FOUND))

    const res = await request(app.getHttpServer()).get('/artists/username/nobody')

    expect(res.status).toBe(404)
  })

  it('DELETE /artists/me deletes the signed-in artist', async () => {
    service.requestDelete.mockResolvedValue(artist as never)

    const res = await request(app.getHttpServer()).delete('/artists/me')

    expect(res.status).toBe(200)
    expect(service.requestDelete).toHaveBeenCalledWith(artist.id)
  })

  it('no longer serves DELETE /artists/:id or PUT /artists/:id', async () => {
    const id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

    const removed = await request(app.getHttpServer()).delete(`/artists/${id}`)
    const updated = await request(app.getHttpServer()).put(`/artists/${id}`).send({ username: 'x' })

    expect(removed.status).toBe(404)
    expect(updated.status).toBe(404)
    expect(service.requestDelete).not.toHaveBeenCalled()
  })

  it("GET /users/me/following/artists lists the listener's followed artists", async () => {
    service.getFollowing.mockResolvedValue({ data: [], limit: 10, page: 1, total: 0 } as never)

    const res = await request(app.getHttpServer()).get(
      '/users/me/following/artists?page=1&limit=10',
    )

    expect(res.status).toBe(200)
    expect(service.getFollowing).toHaveBeenCalledWith('user-1', 1, 10)
  })

  it('no longer serves GET /artists/me/following', async () => {
    const res = await request(app.getHttpServer()).get('/artists/me/following')

    expect(res.status).toBe(404)
    expect(service.getFollowing).not.toHaveBeenCalled()
  })

  it('GET /artists/:id/top-tracks should pass the limit', async () => {
    service.findTopTracks.mockResolvedValue([] as never)
    const id = '0199d0c1-6c2a-7b3e-9a4f-1c2d3e4f5a6b'

    const res = await request(app.getHttpServer())
      .get(`/artists/${id}/top-tracks`)
      .query({ limit: 5 })

    expect(res.status).toBe(200)
    expect(service.findTopTracks).toHaveBeenCalledWith(id, 5)
  })

  it('GET /artists/:id/top-tracks should reject an id that is not a UUID', async () => {
    const res = await request(app.getHttpServer()).get('/artists/nope/top-tracks')

    expect(res.status).toBe(400)
  })

  it('GET /artists/:id/playlists should paginate', async () => {
    service.findPlaylists.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as never)
    const id = '0199d0c1-6c2a-7b3e-9a4f-1c2d3e4f5a6b'

    const res = await request(app.getHttpServer())
      .get(`/artists/${id}/playlists`)
      .query({ page: 1, limit: 20 })

    expect(res.status).toBe(200)
    expect(service.findPlaylists).toHaveBeenCalledWith(id, 1, 20)
  })
})
