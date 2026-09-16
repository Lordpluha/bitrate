import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AdminAuthGuard, type Permission } from '@modules/admin-auth'
import type { INestApplication } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, type TestingModule } from '@nestjs/testing'
import { StubAdminAuthGuard } from '@test/mocks/stub-admin-auth.guard'
import request from 'supertest'

/** `TrackUploadService` pulls in `music-metadata` via `track-media.ts`; that package
 * cannot be resolved under Jest, so every spec that reaches it mocks it virtually. */
jest.mock('music-metadata', () => ({ parseFile: jest.fn() }), { virtual: true })

import { buildAdminTrackRow } from './__tests__/fixtures/admin-tracks.fixtures'
import { AdminTracksController } from './admin-tracks.controller'
import { AdminTracksService } from './admin-tracks.service'
import { TrackNotFoundException } from './errors'

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findById: jest.fn(),
    reprocess: jest.fn(),
  }) as unknown as jest.Mocked<AdminTracksService>

const buildApp = async (permissions: Permission[]) => {
  const service = makeServiceMock()
  const reflector = new Reflector()

  const module: TestingModule = await Test.createTestingModule({
    controllers: [AdminTracksController],
    providers: [{ provide: AdminTracksService, useValue: service }],
  })
    .overrideGuard(AdminAuthGuard)
    .useValue(new StubAdminAuthGuard(reflector, permissions))
    .compile()

  const app = module.createNestApplication()
  await app.init()
  return { app, service }
}

describe('AdminTracksController (int)', () => {
  describe('with tracks:read only', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminTracksService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['tracks:read']))
    })

    afterAll(() => app.close())

    beforeEach(() => {
      service.findAll.mockReset()
      service.findById.mockReset()
      service.reprocess.mockReset()
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
})
