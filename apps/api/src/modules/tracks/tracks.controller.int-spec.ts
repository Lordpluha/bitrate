import { readdir, rm } from 'node:fs/promises'
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ArtistAuthGuard } from '@modules/artists-auth/artists-auth.guard'
import { UserAuthGuard } from '@modules/users-auth/users-auth.guard'
import { type ExecutionContext, type INestApplication, UnauthorizedException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { buildTrack } from './__tests__/fixtures/tracks.fixtures'
import { getUploadTempDir } from './audio-scratch'
import { TrackPlaybackService } from './track-playback.service'
import { TrackUploadService } from './track-upload.service'
import { TracksController } from './tracks.controller'
import { TracksService } from './tracks.service'

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
  let uploadDir: string

  beforeAll(async () => {
    uploadDir = getUploadTempDir()
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
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest<{
            headers: Record<string, string | undefined>
            artist?: { id: string; username: string }
          }>()
          if (req.headers['x-test-artist'] !== 'artist-1') throw new UnauthorizedException()
          req.artist = { id: 'artist-1', username: 'artist' }
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

  afterAll(async () => {
    await app.close()
    await rm(uploadDir, { recursive: true, force: true })
  })

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

  it.each(['post', 'put'] as const)(
    '%s rejects authenticated direct uploads before staging files',
    async (method) => {
      const before = await readdir(uploadDir)
      const path = method === 'post' ? '/tracks' : '/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479'
      const res = await request(app.getHttpServer())
        [method](path)
        .set('x-test-artist', 'artist-1')
        .field('title', 'Unreviewed recording')
        .field('rightsConfirmed', 'true')
        .attach('audio', Buffer.from('RIFF-audio'), {
          filename: 'track.wav',
          contentType: 'audio/wav',
        })
      expect(res.status).toBe(403)
      expect(res.body.message).toBe('errors.track.release_workflow_required')
      expect(await readdir(uploadDir)).toEqual(before)
      expect(uploadService.create).not.toHaveBeenCalled()
      expect(uploadService.update).not.toHaveBeenCalled()
    },
  )

  it.each(['post', 'put'] as const)('%s still requires artist authentication', async (method) => {
    const path = method === 'post' ? '/tracks' : '/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479'
    await request(app.getHttpServer())[method](path).send({ title: 'Unreviewed' }).expect(401)
    expect(uploadService.create).not.toHaveBeenCalled()
    expect(uploadService.update).not.toHaveBeenCalled()
  })

  it('also rejects direct JSON metadata edits to the catalogue', async () => {
    await request(app.getHttpServer())
      .put('/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479')
      .set('x-test-artist', 'artist-1')
      .send({ title: 'Unreviewed title' })
      .expect(403)
    expect(uploadService.update).not.toHaveBeenCalled()
  })
})
