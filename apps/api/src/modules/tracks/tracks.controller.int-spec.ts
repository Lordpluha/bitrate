import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ArtistAuthGuard } from '@modules/artists-auth/artists-auth.guard'
import { UserAuthGuard } from '@modules/users-auth/users-auth.guard'
import type { INestApplication } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { buildTrack } from './__tests__/fixtures/tracks.fixtures'
import { TrackPlaybackService } from './track-playback.service'
import { TrackUploadService } from './track-upload.service'
import { TracksController } from './tracks.controller'
import { TracksService } from './tracks.service'

jest.mock('music-metadata', () => ({ parseFile: jest.fn() }), { virtual: true })

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findTrackById: jest.fn(),
    findLikedTracks: jest.fn(),
  }) as unknown as jest.Mocked<TracksService>

const makeUploadMock = () =>
  ({
    create: jest.fn(),
    update: jest.fn(),
  }) as unknown as jest.Mocked<TrackUploadService>

const makePlaybackMock = () =>
  ({
    getManifest: jest.fn(),
    getRenditionStream: jest.fn(),
  }) as unknown as jest.Mocked<TrackPlaybackService>

describe('TracksController (int)', () => {
  let app: INestApplication
  let service: jest.Mocked<TracksService>
  let uploadService: jest.Mocked<TrackUploadService>

  beforeAll(async () => {
    service = makeServiceMock()
    uploadService = makeUploadMock()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TracksController],
      providers: [
        { provide: TracksService, useValue: service },
        { provide: TrackUploadService, useValue: uploadService },
        { provide: TrackPlaybackService, useValue: makePlaybackMock() },
      ],
    })
      .overrideGuard(ArtistAuthGuard)
      .useValue({
        canActivate: (ctx: {
          switchToHttp: () => { getRequest: () => Record<string, unknown> }
        }) => {
          ctx.switchToHttp().getRequest().artist = { id: 'artist-1', username: 'artist' }
          return true
        },
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
      .compile()

    app = module.createNestApplication()
    await app.init()
  })

  afterAll(() => app.close())

  beforeEach(() => {
    service.findAll.mockReset()
    service.findTrackById.mockReset()
    uploadService.create.mockReset()
    uploadService.update.mockReset()
    service.findLikedTracks.mockReset()
  })

  it('GET /tracks should return 200', async () => {
    service.findAll.mockResolvedValue({
      data: [buildTrack()],
      meta: { total: 1, page: 1, limit: 10, lastPage: 1 },
    } as never)

    const res = await request(app.getHttpServer()).get('/tracks')

    expect(res.status).toBe(200)
    expect(service.findAll).toHaveBeenCalled()
  })

  it('GET /tracks/:id with valid UUID should return 200', async () => {
    service.findTrackById.mockResolvedValue(
      buildTrack({ id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' }) as never,
    )

    const res = await request(app.getHttpServer()).get(
      '/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479',
    )

    expect(res.status).toBe(200)
  })

  it('GET /tracks/:id with invalid UUID should return 400', async () => {
    const res = await request(app.getHttpServer()).get('/tracks/not-a-uuid')

    expect(res.status).toBe(400)
  })

  it('GET /tracks/liked should call findLikedTracks with user id', async () => {
    service.findLikedTracks.mockResolvedValue([] as never)

    const res = await request(app.getHttpServer()).get('/tracks/liked')

    expect(res.status).toBe(200)
    expect(service.findLikedTracks).toHaveBeenCalledWith('user-1', expect.any(Object))
  })

  it.each([
    '/tracks/stream/f47ac10b-58cc-4372-a567-0e02b2c3d479',
    '/tracks/stream/f47ac10b-58cc-4372-a567-0e02b2c3d479/hls/master.m3u8',
    '/tracks/stream/f47ac10b-58cc-4372-a567-0e02b2c3d479/hls/192/segment_00000.m4s',
  ])('GET %s no longer exists: CMAF is the only audio route (ADR-0065)', async (path) => {
    await request(app.getHttpServer()).get(path).expect(404)
  })

  it('PUT /tracks/:id should call uploadService.update and return 200', async () => {
    uploadService.update.mockResolvedValue(buildTrack() as never)

    const res = await request(app.getHttpServer())
      .put('/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479')
      .field('title', 'Updated Title')

    expect(res.status).toBe(200)
    expect(uploadService.update).toHaveBeenCalledWith(
      'artist-1',
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      { title: 'Updated Title' } as never,
      undefined,
      undefined,
    )
  })
})
