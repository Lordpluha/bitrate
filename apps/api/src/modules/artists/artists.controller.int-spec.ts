import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ArtistAuthGuard } from '@modules/artists-auth/artists-auth.guard'
import { UserAuthGuard } from '@modules/users-auth/users-auth.guard'
import type { INestApplication } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { buildArtist } from './__tests__/fixtures/artists.fixtures'
import { ArtistsController } from './artists.controller'
import { ArtistsService } from './artists.service'

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUsername: jest.fn(),
    update: jest.fn(),
    requestDelete: jest.fn(),
  }) as unknown as jest.Mocked<ArtistsService>

describe('ArtistsController (int)', () => {
  let app: INestApplication
  let service: jest.Mocked<ArtistsService>
  const artist = buildArtist()

  beforeAll(async () => {
    service = makeServiceMock()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtistsController],
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
    service.findByUsername.mockReset()
    service.update.mockReset()
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

  it('PUT /artists/:id should call service.update and return 200', async () => {
    service.update.mockResolvedValue(buildArtist({ username: 'updated' }) as never)

    const res = await request(app.getHttpServer())
      .put('/artists/f47ac10b-58cc-4372-a567-0e02b2c3d479')
      .send({ username: 'updated' })

    expect(res.status).toBe(200)
    expect(service.update).toHaveBeenCalledWith(
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      expect.objectContaining({ username: 'updated' }),
      artist.id,
    )
  })

  it('DELETE /artists/:id should call service.requestDelete and return 200', async () => {
    service.requestDelete.mockResolvedValue(artist as never)

    const res = await request(app.getHttpServer()).delete(
      '/artists/f47ac10b-58cc-4372-a567-0e02b2c3d479',
    )

    expect(res.status).toBe(200)
    expect(service.requestDelete).toHaveBeenCalledWith(
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      artist.id,
    )
  })
})
