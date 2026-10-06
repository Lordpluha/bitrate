import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AdminAuthGuard, type Permission } from '@modules/admin-auth'
import type { INestApplication } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, type TestingModule } from '@nestjs/testing'
import { StubAdminAuthGuard } from '@test/mocks/stub-admin-auth.guard'
import request from 'supertest'
import {
  buildAdminEpisodeRow,
  buildAdminPodcastRow,
} from './__tests__/fixtures/admin-podcasts.fixtures'
import { AdminPodcastsController } from './admin-podcasts.controller'
import { AdminPodcastsService } from './admin-podcasts.service'
import {
  EpisodeAlreadyDeletedException,
  EpisodeNotDeletedException,
  EpisodeNotFoundException,
  PodcastAlreadyDeletedException,
  PodcastNotDeletedException,
  PodcastNotFoundException,
} from './errors'

const ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
const EPISODE_ID = '0a1b2c3d-58cc-4372-a567-0e02b2c3d479'

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findById: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    softDeleteEpisode: jest.fn(),
    restoreEpisode: jest.fn(),
  }) as unknown as jest.Mocked<AdminPodcastsService>

const buildApp = async (permissions: Permission[]) => {
  const service = makeServiceMock()
  const module: TestingModule = await Test.createTestingModule({
    controllers: [AdminPodcastsController],
    providers: [{ provide: AdminPodcastsService, useValue: service }],
  })
    .overrideGuard(AdminAuthGuard)
    .useValue(new StubAdminAuthGuard(new Reflector(), permissions))
    .compile()

  const app = module.createNestApplication()
  await app.init()
  return { app, service }
}

describe('AdminPodcastsController (int)', () => {
  describe('with podcasts:read only', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminPodcastsService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['podcasts:read']))
    })

    afterAll(() => app.close())

    beforeEach(() => {
      service.findAll.mockReset()
      service.findById.mockReset()
    })

    it('GET /admin/podcasts returns 200 and forwards the parsed query', async () => {
      const row = buildAdminPodcastRow()
      service.findAll.mockResolvedValue({ data: [row], total: 1, page: 1, limit: 20 } as never)

      const res = await request(app.getHttpServer())
        .get('/admin/podcasts')
        .query({ status: 'deactivated', q: 'signal', sort: 'title', order: 'asc' })

      expect(res.status).toBe(200)
      expect(res.body).toEqual(
        JSON.parse(JSON.stringify({ data: [row], total: 1, page: 1, limit: 20 })),
      )
      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'deactivated',
          q: 'signal',
          sort: 'title',
          order: 'asc',
        }),
      )
    })

    it('GET /admin/podcasts returns 400 for a sort field outside the allowlist', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/podcasts')
        .query({ sort: 'description' })

      expect(res.status).toBe(400)
      expect(service.findAll).not.toHaveBeenCalled()
    })

    it('GET /admin/podcasts returns 400 for an invalid status', async () => {
      expect(
        (await request(app.getHttpServer()).get('/admin/podcasts').query({ status: 'bogus' }))
          .status,
      ).toBe(400)
    })

    it('GET /admin/podcasts/:id returns 200', async () => {
      service.findById.mockResolvedValue({ ...buildAdminPodcastRow(), episodes: [] } as never)

      const res = await request(app.getHttpServer()).get(`/admin/podcasts/${ID}`)

      expect(res.status).toBe(200)
      expect(service.findById).toHaveBeenCalledWith(ID)
    })

    it('GET /admin/podcasts/:id returns 404 for an unknown podcast', async () => {
      service.findById.mockRejectedValue(new PodcastNotFoundException(ID))

      expect((await request(app.getHttpServer()).get(`/admin/podcasts/${ID}`)).status).toBe(404)
    })

    it('GET /admin/podcasts/:id returns 400 for a non-UUID id', async () => {
      expect((await request(app.getHttpServer()).get('/admin/podcasts/not-a-uuid')).status).toBe(
        400,
      )
    })
  })

  describe('with podcasts:delete and podcasts:restore', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminPodcastsService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['podcasts:delete', 'podcasts:restore']))
    })

    afterAll(() => app.close())

    beforeEach(() => {
      service.softDelete.mockReset()
      service.restore.mockReset()
      service.softDeleteEpisode.mockReset()
      service.restoreEpisode.mockReset()
    })

    it('DELETE /admin/podcasts/:id returns 200 and forwards the optional reason', async () => {
      service.softDelete.mockResolvedValue(buildAdminPodcastRow({ deletedAt: new Date() }) as never)

      const res = await request(app.getHttpServer())
        .delete(`/admin/podcasts/${ID}`)
        .send({ reason: 'rights claim' })

      expect(res.status).toBe(200)
      expect(service.softDelete).toHaveBeenCalledWith(
        ID,
        'staff-1',
        'rights claim',
        expect.any(Object),
      )
    })

    it('DELETE /admin/podcasts/:id returns 200 with no body at all', async () => {
      service.softDelete.mockResolvedValue(buildAdminPodcastRow({ deletedAt: new Date() }) as never)

      const res = await request(app.getHttpServer()).delete(`/admin/podcasts/${ID}`)

      expect(res.status).toBe(200)
      expect(service.softDelete).toHaveBeenCalledWith(ID, 'staff-1', undefined, expect.any(Object))
    })

    it('DELETE /admin/podcasts/:id returns 409 when already deleted', async () => {
      service.softDelete.mockRejectedValue(new PodcastAlreadyDeletedException(ID))

      expect((await request(app.getHttpServer()).delete(`/admin/podcasts/${ID}`)).status).toBe(409)
    })

    it('DELETE /admin/podcasts/:id returns 404 for an unknown podcast', async () => {
      service.softDelete.mockRejectedValue(new PodcastNotFoundException(ID))

      expect((await request(app.getHttpServer()).delete(`/admin/podcasts/${ID}`)).status).toBe(404)
    })

    it('DELETE /admin/podcasts/:id returns 400 when reason exceeds 500 characters', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/admin/podcasts/${ID}`)
        .send({ reason: 'x'.repeat(501) })

      expect(res.status).toBe(400)
      expect(service.softDelete).not.toHaveBeenCalled()
    })

    it('POST /admin/podcasts/:id/restore returns 200, 409 or 404', async () => {
      const url = `/admin/podcasts/${ID}/restore`
      service.restore.mockResolvedValueOnce(buildAdminPodcastRow() as never)
      expect((await request(app.getHttpServer()).post(url)).status).toBe(200)

      service.restore.mockRejectedValueOnce(new PodcastNotDeletedException(ID))
      expect((await request(app.getHttpServer()).post(url)).status).toBe(409)

      service.restore.mockRejectedValueOnce(new PodcastNotFoundException(ID))
      expect((await request(app.getHttpServer()).post(url)).status).toBe(404)
    })

    it('DELETE /admin/podcasts/:id/episodes/:episodeId forwards both ids and the reason', async () => {
      service.softDeleteEpisode.mockResolvedValue(
        buildAdminEpisodeRow({ deletedAt: new Date() }) as never,
      )

      const res = await request(app.getHttpServer())
        .delete(`/admin/podcasts/${ID}/episodes/${EPISODE_ID}`)
        .send({ reason: 'dmca' })

      expect(res.status).toBe(200)
      expect(service.softDeleteEpisode).toHaveBeenCalledWith(
        ID,
        EPISODE_ID,
        'staff-1',
        'dmca',
        expect.any(Object),
      )
    })

    it('DELETE /admin/podcasts/:id/episodes/:episodeId returns 404 and 409 from the service', async () => {
      const url = `/admin/podcasts/${ID}/episodes/${EPISODE_ID}`
      service.softDeleteEpisode.mockRejectedValueOnce(new EpisodeNotFoundException(EPISODE_ID))
      expect((await request(app.getHttpServer()).delete(url)).status).toBe(404)

      service.softDeleteEpisode.mockRejectedValueOnce(
        new EpisodeAlreadyDeletedException(EPISODE_ID),
      )
      expect((await request(app.getHttpServer()).delete(url)).status).toBe(409)
    })

    it('DELETE /admin/podcasts/:id/episodes/:episodeId returns 400 for a non-UUID episode id', async () => {
      const res = await request(app.getHttpServer()).delete(`/admin/podcasts/${ID}/episodes/nope`)

      expect(res.status).toBe(400)
      expect(service.softDeleteEpisode).not.toHaveBeenCalled()
    })

    it('POST /admin/podcasts/:id/episodes/:episodeId/restore returns 200, 409 or 404', async () => {
      const url = `/admin/podcasts/${ID}/episodes/${EPISODE_ID}/restore`
      service.restoreEpisode.mockResolvedValueOnce(buildAdminEpisodeRow() as never)
      expect((await request(app.getHttpServer()).post(url)).status).toBe(200)
      expect(service.restoreEpisode).toHaveBeenCalledWith(
        ID,
        EPISODE_ID,
        'staff-1',
        undefined,
        expect.any(Object),
      )

      service.restoreEpisode.mockRejectedValueOnce(new EpisodeNotDeletedException(EPISODE_ID))
      expect((await request(app.getHttpServer()).post(url)).status).toBe(409)

      service.restoreEpisode.mockRejectedValueOnce(new EpisodeNotFoundException(EPISODE_ID))
      expect((await request(app.getHttpServer()).post(url)).status).toBe(404)
    })
  })

  describe('without the matching permissions', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminPodcastsService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['podcasts:read']))
    })

    afterAll(() => app.close())

    it('every mutating route returns 403', async () => {
      const http = app.getHttpServer()
      expect((await request(http).delete(`/admin/podcasts/${ID}`)).status).toBe(403)
      expect((await request(http).post(`/admin/podcasts/${ID}/restore`)).status).toBe(403)
      expect(
        (await request(http).delete(`/admin/podcasts/${ID}/episodes/${EPISODE_ID}`)).status,
      ).toBe(403)
      expect(
        (await request(http).post(`/admin/podcasts/${ID}/episodes/${EPISODE_ID}/restore`)).status,
      ).toBe(403)
      expect(service.softDelete).not.toHaveBeenCalled()
      expect(service.softDeleteEpisode).not.toHaveBeenCalled()
    })
  })

  describe('without podcasts:read', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminPodcastsService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['podcasts:delete']))
    })

    afterAll(() => app.close())

    it('GET /admin/podcasts and /admin/podcasts/:id return 403', async () => {
      expect((await request(app.getHttpServer()).get('/admin/podcasts')).status).toBe(403)
      expect((await request(app.getHttpServer()).get(`/admin/podcasts/${ID}`)).status).toBe(403)
      expect(service.findAll).not.toHaveBeenCalled()
    })
  })
})
