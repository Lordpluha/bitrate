import { Readable } from 'node:stream'
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AdminAuthGuard, type Permission } from '@modules/admin-auth'
import { UnsatisfiableRangeError } from '@modules/tracks'
import type { INestApplication } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, type TestingModule } from '@nestjs/testing'
import { StubAdminAuthGuard } from '@test/mocks/stub-admin-auth.guard'
import request from 'supertest'

/** `TrackUploadService` pulls in `music-metadata` via `track-media.ts`; that package
 * cannot be resolved under Jest, so every spec that reaches it mocks it virtually. */
jest.mock('music-metadata', () => ({ parseFile: jest.fn() }), { virtual: true })

import {
  buildAdminTrackRow,
  buildTrackProcessingAttempt,
} from './__tests__/fixtures/admin-tracks.fixtures'
import { AdminTrackAudioService } from './admin-track-audio.service'
import { AdminTracksController } from './admin-tracks.controller'
import { AdminTracksService } from './admin-tracks.service'
import {
  TrackAlreadyDeletedException,
  TrackAudioNotAvailableException,
  TrackNotDeletedException,
  TrackNotFoundException,
} from './errors'

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findById: jest.fn(),
    findProcessingAttempts: jest.fn(),
    reprocess: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
  }) as unknown as jest.Mocked<AdminTracksService>

const makeAudioServiceMock = () =>
  ({
    stream: jest.fn(),
    head: jest.fn(),
  }) as unknown as jest.Mocked<AdminTrackAudioService>

const buildApp = async (permissions: Permission[]) => {
  const service = makeServiceMock()
  const audioService = makeAudioServiceMock()
  const reflector = new Reflector()

  const module: TestingModule = await Test.createTestingModule({
    controllers: [AdminTracksController],
    providers: [
      { provide: AdminTracksService, useValue: service },
      { provide: AdminTrackAudioService, useValue: audioService },
    ],
  })
    .overrideGuard(AdminAuthGuard)
    .useValue(new StubAdminAuthGuard(reflector, permissions))
    .compile()

  const app = module.createNestApplication()
  await app.init()
  return { app, service, audioService }
}

describe('AdminTracksController (int)', () => {
  describe('with tracks:read only', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminTracksService>
    let audioService: jest.Mocked<AdminTrackAudioService>

    beforeAll(async () => {
      ;({ app, service, audioService } = await buildApp(['tracks:read']))
    })

    afterAll(() => app.close())

    beforeEach(() => {
      service.findAll.mockReset()
      service.findById.mockReset()
      service.findProcessingAttempts.mockReset()
      service.reprocess.mockReset()
      audioService.stream.mockReset()
      audioService.head.mockReset()
    })

    it('GET /admin/tracks returns 200', async () => {
      const row = buildAdminTrackRow({ processingStatus: 'FAILED' })
      service.findAll.mockResolvedValue({ data: [row], total: 1, page: 1, limit: 20 } as never)

      const res = await request(app.getHttpServer()).get('/admin/tracks')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(
        JSON.parse(JSON.stringify({ data: [row], total: 1, page: 1, limit: 20 })),
      )
    })

    it('GET /admin/tracks returns 400 for a sort field outside the allowlist', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/tracks')
        .query({ sort: 'processingError' })

      expect(res.status).toBe(400)
      expect(service.findAll).not.toHaveBeenCalled()
    })

    it('GET /admin/tracks returns 400 for an invalid status', async () => {
      const res = await request(app.getHttpServer()).get('/admin/tracks').query({ status: 'bogus' })

      expect(res.status).toBe(400)
      expect(service.findAll).not.toHaveBeenCalled()
    })

    it('GET /admin/tracks returns 400 for an invalid order', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/tracks')
        .query({ sort: 'title', order: 'sideways' })

      expect(res.status).toBe(400)
    })

    it('GET /admin/tracks/:id returns 404 for a missing track', async () => {
      service.findById.mockRejectedValue(new TrackNotFoundException('missing'))

      const res = await request(app.getHttpServer()).get(
        '/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479',
      )

      expect(res.status).toBe(404)
    })

    it('GET /admin/tracks/:id/audio returns 206 with range headers', async () => {
      audioService.stream.mockResolvedValue({
        stream: Readable.from([Buffer.alloc(1024, 'a')]),
        fileSize: 1_456_523,
        contentType: 'audio/mp4',
        bitrate: 192,
        start: 0,
        end: 1023,
        contentLength: 1024,
        isPartial: true,
      } as never)

      const res = await request(app.getHttpServer())
        .get('/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479/audio')
        .set('Range', 'bytes=0-1023')

      expect(res.status).toBe(206)
      expect(res.headers['content-type']).toBe('audio/mp4')
      expect(res.headers['accept-ranges']).toBe('bytes')
      expect(res.headers['content-length']).toBe('1024')
      expect(res.headers['content-range']).toBe('bytes 0-1023/1456523')
      expect(res.headers['cache-control']).toBe('private, no-store')
      expect(audioService.stream).toHaveBeenCalledWith(
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        undefined,
        'bytes=0-1023',
      )
    })

    it('GET /admin/tracks/:id/audio returns 200 without a Range header', async () => {
      audioService.stream.mockResolvedValue({
        stream: Readable.from([Buffer.from('abcd')]),
        fileSize: 4,
        contentType: 'audio/mp4',
        bitrate: 320,
        start: 0,
        end: 3,
        contentLength: 4,
        isPartial: false,
      } as never)

      const res = await request(app.getHttpServer()).get(
        '/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479/audio',
      )

      expect(res.status).toBe(200)
      expect(res.headers['content-range']).toBeUndefined()
    })

    it('GET /admin/tracks/:id/audio returns 416 for an unsatisfiable range', async () => {
      audioService.stream.mockRejectedValue(new UnsatisfiableRangeError(1_456_523))

      const res = await request(app.getHttpServer())
        .get('/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479/audio')
        .set('Range', 'bytes=9999999-')

      expect(res.status).toBe(416)
      expect(res.headers['content-range']).toBe('bytes */1456523')
    })

    it('GET /admin/tracks/:id/audio returns 404 for a non-READY track', async () => {
      audioService.stream.mockRejectedValue(
        new TrackAudioNotAvailableException('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'PROCESSING'),
      )

      const res = await request(app.getHttpServer()).get(
        '/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479/audio',
      )

      expect(res.status).toBe(404)
    })

    it('HEAD /admin/tracks/:id/audio returns headers with an empty body', async () => {
      audioService.head.mockResolvedValue({
        fileSize: 2_101_902,
        contentType: 'audio/mp4',
        bitrate: 320,
      } as never)

      const res = await request(app.getHttpServer()).head(
        '/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479/audio',
      )

      expect(res.status).toBe(200)
      expect(res.headers['content-length']).toBe('2101902')
      expect(res.headers['content-type']).toBe('audio/mp4')
      expect(res.text).toBeFalsy()
    })

    it('POST /admin/tracks/:id/reprocess returns 403 — missing tracks:reprocess', async () => {
      const res = await request(app.getHttpServer()).post(
        '/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479/reprocess',
      )

      expect(res.status).toBe(403)
      expect(service.reprocess).not.toHaveBeenCalled()
    })

    it('GET /admin/tracks/:id returns 400 for a non-UUID id', async () => {
      const res = await request(app.getHttpServer()).get('/admin/tracks/not-a-uuid')

      expect(res.status).toBe(400)
    })

    it('GET /admin/tracks/:id/processing-attempts returns 200', async () => {
      const attempt = buildTrackProcessingAttempt()
      service.findProcessingAttempts.mockResolvedValue({
        data: [attempt],
        total: 1,
        page: 1,
        limit: 20,
      } as never)

      const res = await request(app.getHttpServer()).get(
        '/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479/processing-attempts',
      )

      expect(res.status).toBe(200)
      expect(res.body).toEqual(
        JSON.parse(JSON.stringify({ data: [attempt], total: 1, page: 1, limit: 20 })),
      )
      expect(service.findProcessingAttempts).toHaveBeenCalledWith(
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        {},
      )
    })

    it('GET /admin/tracks/:id/processing-attempts returns 404 for a missing track', async () => {
      service.findProcessingAttempts.mockRejectedValue(new TrackNotFoundException('missing'))

      const res = await request(app.getHttpServer()).get(
        '/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479/processing-attempts',
      )

      expect(res.status).toBe(404)
    })

    it('GET /admin/tracks/:id/processing-attempts returns 400 for limit=101', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479/processing-attempts')
        .query({ limit: 101 })

      expect(res.status).toBe(400)
      expect(service.findProcessingAttempts).not.toHaveBeenCalled()
    })
  })

  describe('with tracks:reprocess', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminTracksService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['tracks:read', 'tracks:reprocess']))
    })

    afterAll(() => app.close())

    beforeEach(() => {
      service.reprocess.mockReset()
    })

    it('POST /admin/tracks/:id/reprocess returns 200', async () => {
      const row = buildAdminTrackRow({ processingStatus: 'PROCESSING' })
      service.reprocess.mockResolvedValue(row as never)

      const res = await request(app.getHttpServer()).post(
        '/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479/reprocess',
      )

      expect(res.status).toBe(200)
      expect(service.reprocess).toHaveBeenCalledWith('f47ac10b-58cc-4372-a567-0e02b2c3d479')
    })

    it('POST /admin/tracks/:id/reprocess returns 404 for a missing track', async () => {
      service.reprocess.mockRejectedValue(new TrackNotFoundException('missing'))

      const res = await request(app.getHttpServer()).post(
        '/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479/reprocess',
      )

      expect(res.status).toBe(404)
    })
  })

  describe('with tracks:delete and tracks:restore', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminTracksService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['tracks:delete', 'tracks:restore']))
    })

    afterAll(() => app.close())

    beforeEach(() => {
      service.softDelete.mockReset()
      service.restore.mockReset()
    })

    it('DELETE /admin/tracks/:id returns 200 and forwards the optional reason', async () => {
      const row = buildAdminTrackRow({ deletedAt: new Date() })
      service.softDelete.mockResolvedValue(row as never)

      const res = await request(app.getHttpServer())
        .delete('/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479')
        .send({ reason: 'rights claim' })

      expect(res.status).toBe(200)
      expect(service.softDelete).toHaveBeenCalledWith(
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        'staff-1',
        'rights claim',
        expect.any(Object),
      )
    })

    it('DELETE /admin/tracks/:id returns 200 with no body at all', async () => {
      service.softDelete.mockResolvedValue(buildAdminTrackRow({ deletedAt: new Date() }) as never)

      const res = await request(app.getHttpServer()).delete(
        '/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479',
      )

      expect(res.status).toBe(200)
      expect(service.softDelete).toHaveBeenCalledWith(
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        'staff-1',
        undefined,
        expect.any(Object),
      )
    })

    it('DELETE /admin/tracks/:id returns 409 when already deleted', async () => {
      service.softDelete.mockRejectedValue(
        new TrackAlreadyDeletedException('f47ac10b-58cc-4372-a567-0e02b2c3d479'),
      )

      const res = await request(app.getHttpServer()).delete(
        '/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479',
      )

      expect(res.status).toBe(409)
    })

    it('DELETE /admin/tracks/:id returns 400 when reason exceeds 500 characters', async () => {
      const res = await request(app.getHttpServer())
        .delete('/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479')
        .send({ reason: 'x'.repeat(501) })

      expect(res.status).toBe(400)
      expect(service.softDelete).not.toHaveBeenCalled()
    })

    it('POST /admin/tracks/:id/restore returns 200', async () => {
      service.restore.mockResolvedValue(buildAdminTrackRow({ deletedAt: null }) as never)

      const res = await request(app.getHttpServer()).post(
        '/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479/restore',
      )

      expect(res.status).toBe(200)
    })

    it('POST /admin/tracks/:id/restore returns 409 when not deleted', async () => {
      service.restore.mockRejectedValue(
        new TrackNotDeletedException('f47ac10b-58cc-4372-a567-0e02b2c3d479'),
      )

      const res = await request(app.getHttpServer()).post(
        '/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479/restore',
      )

      expect(res.status).toBe(409)
    })
  })

  describe('without tracks:delete/tracks:restore', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminTracksService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['tracks:read']))
    })

    afterAll(() => app.close())

    it('DELETE /admin/tracks/:id returns 403', async () => {
      const res = await request(app.getHttpServer()).delete(
        '/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479',
      )

      expect(res.status).toBe(403)
      expect(service.softDelete).not.toHaveBeenCalled()
    })

    it('POST /admin/tracks/:id/restore returns 403', async () => {
      const res = await request(app.getHttpServer()).post(
        '/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479/restore',
      )

      expect(res.status).toBe(403)
      expect(service.restore).not.toHaveBeenCalled()
    })
  })

  describe('without tracks:read', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminTracksService>
    let audioService: jest.Mocked<AdminTrackAudioService>

    beforeAll(async () => {
      ;({ app, service, audioService } = await buildApp([]))
    })

    afterAll(() => app.close())

    it('GET /admin/tracks/:id/processing-attempts returns 403', async () => {
      const res = await request(app.getHttpServer()).get(
        '/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479/processing-attempts',
      )

      expect(res.status).toBe(403)
      expect(service.findProcessingAttempts).not.toHaveBeenCalled()
    })

    it('GET /admin/tracks/:id/audio returns 403', async () => {
      const res = await request(app.getHttpServer()).get(
        '/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479/audio',
      )

      expect(res.status).toBe(403)
      expect(audioService.stream).not.toHaveBeenCalled()
    })
  })
})
