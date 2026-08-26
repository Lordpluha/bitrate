import { Readable } from 'node:stream'
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ArtistAuthGuard } from '@modules/artists-auth/artists-auth.guard'
import { UserAuthGuard } from '@modules/users-auth/users-auth.guard'
import type { INestApplication } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { buildTrack } from './__tests__/fixtures/tracks.fixtures'
import { TracksController } from './tracks.controller'
import { TrackPlaybackService } from './track-playback.service'
import { TracksService } from './tracks.service'

jest.mock('music-metadata', () => ({ parseFile: jest.fn() }), { virtual: true })

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findTrackById: jest.fn(),
    getTrackStream: jest.fn(),
    getHlsMasterPlaylist: jest.fn(),
    getHlsAsset: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findLikedTracks: jest.fn(),
  }) as unknown as jest.Mocked<TracksService>

const makePlaybackMock = () =>
  ({
    getManifest: jest.fn(),
    getRenditionStream: jest.fn(),
  }) as unknown as jest.Mocked<TrackPlaybackService>

describe('TracksController (int)', () => {
  let app: INestApplication
  let service: jest.Mocked<TracksService>

  beforeAll(async () => {
    service = makeServiceMock()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TracksController],
      providers: [
        { provide: TracksService, useValue: service },
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
    service.getTrackStream.mockReset()
    service.create.mockReset()
    service.update.mockReset()
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

  it('GET /tracks/stream/:id should pipe audio stream and return 200', async () => {
    const mockStream = new Readable({
      read() {
        this.push(null)
      },
    })
    service.getTrackStream.mockResolvedValue({
      stream: mockStream,
      contentType: 'audio/mpeg',
      contentLength: 0,
      fileSize: 0,
      start: 0,
      end: 0,
      isPartial: false,
    } as never)

    const res = await request(app.getHttpServer()).get(
      '/tracks/stream/f47ac10b-58cc-4372-a567-0e02b2c3d479',
    )

    expect(res.status).toBe(200)
    expect(service.getTrackStream).toHaveBeenCalledWith(
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      undefined,
      undefined,
      undefined,
    )
    expect(res.headers['content-type']).toContain('audio/mpeg')
    expect(res.headers['accept-ranges']).toBe('bytes')
  })

  it('GET /tracks/stream/:id with Range header should return 206', async () => {
    const mockStream = new Readable({
      read() {
        this.push(Buffer.alloc(512))
        this.push(null)
      },
    })
    service.getTrackStream.mockResolvedValue({
      stream: mockStream,
      contentType: 'audio/mpeg',
      contentLength: 512,
      fileSize: 2048,
      start: 0,
      end: 511,
      isPartial: true,
    } as never)

    const res = await request(app.getHttpServer())
      .get('/tracks/stream/f47ac10b-58cc-4372-a567-0e02b2c3d479')
      .set('Range', 'bytes=0-511')

    expect(res.status).toBe(206)
    expect(service.getTrackStream).toHaveBeenCalledWith(
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      'bytes=0-511',
      undefined,
      undefined,
    )
    expect(res.headers['content-range']).toBe('bytes 0-511/2048')
  })

  it('PUT /tracks/:id should call service.update and return 200', async () => {
    service.update.mockResolvedValue(buildTrack() as never)

    const res = await request(app.getHttpServer())
      .put('/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479')
      .field('title', 'Updated Title')

    expect(res.status).toBe(200)
    expect(service.update).toHaveBeenCalledWith(
      'artist-1',
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      { title: 'Updated Title' } as never,
      undefined,
      undefined,
    )
  })
})
