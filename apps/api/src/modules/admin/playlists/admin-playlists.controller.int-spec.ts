import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AdminAuthGuard, type Permission } from '@modules/admin-auth'
import type { INestApplication } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, type TestingModule } from '@nestjs/testing'
import { StubAdminAuthGuard } from '@test/mocks/stub-admin-auth.guard'
import request from 'supertest'
import { buildAdminPlaylistRow } from './__tests__/fixtures/admin-playlists.fixtures'
import { AdminPlaylistsController } from './admin-playlists.controller'
import { AdminPlaylistsService } from './admin-playlists.service'
import {
  PlaylistAlreadyDeletedException,
  PlaylistAlreadyHiddenException,
  PlaylistNotDeletedException,
  PlaylistNotFoundException,
  PlaylistNotHiddenByOperatorException,
} from './errors'

const ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findById: jest.fn(),
    setVisibility: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
  }) as unknown as jest.Mocked<AdminPlaylistsService>

const buildApp = async (permissions: Permission[]) => {
  const service = makeServiceMock()
  const module: TestingModule = await Test.createTestingModule({
    controllers: [AdminPlaylistsController],
    providers: [{ provide: AdminPlaylistsService, useValue: service }],
  })
    .overrideGuard(AdminAuthGuard)
    .useValue(new StubAdminAuthGuard(new Reflector(), permissions))
    .compile()

  const app = module.createNestApplication()
  await app.init()
  return { app, service }
}

describe('AdminPlaylistsController (int)', () => {
  describe('with playlists:read only', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminPlaylistsService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['playlists:read']))
    })

    afterAll(() => app.close())

    beforeEach(() => {
      service.findAll.mockReset()
      service.findById.mockReset()
    })

    it('GET /admin/playlists returns 200 and forwards the parsed query', async () => {
      const row = buildAdminPlaylistRow()
      service.findAll.mockResolvedValue({ data: [row], total: 1, page: 1, limit: 20 } as never)

      const res = await request(app.getHttpServer())
        .get('/admin/playlists')
        .query({ status: 'deactivated', ownerId: ID, q: 'night', sort: 'title', order: 'asc' })

      expect(res.status).toBe(200)
      expect(res.body).toEqual(
        JSON.parse(JSON.stringify({ data: [row], total: 1, page: 1, limit: 20 })),
      )
      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'deactivated',
          ownerId: ID,
          q: 'night',
          sort: 'title',
          order: 'asc',
        }),
      )
    })

    it('GET /admin/playlists returns 400 for a sort field outside the allowlist', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/playlists')
        .query({ sort: 'description' })

      expect(res.status).toBe(400)
      expect(service.findAll).not.toHaveBeenCalled()
    })

    it('GET /admin/playlists returns 400 for an invalid status or ownerId', async () => {
      expect(
        (await request(app.getHttpServer()).get('/admin/playlists').query({ status: 'bogus' }))
          .status,
      ).toBe(400)
      expect(
        (await request(app.getHttpServer()).get('/admin/playlists').query({ ownerId: 'nope' }))
          .status,
      ).toBe(400)
    })

    it('GET /admin/playlists/:id returns 200', async () => {
      service.findById.mockResolvedValue({ ...buildAdminPlaylistRow(), tracks: [] } as never)

      const res = await request(app.getHttpServer()).get(`/admin/playlists/${ID}`)

      expect(res.status).toBe(200)
      expect(service.findById).toHaveBeenCalledWith(ID)
    })

    it('GET /admin/playlists/:id returns 404 for an unknown album', async () => {
      service.findById.mockRejectedValue(new PlaylistNotFoundException(ID))

      expect((await request(app.getHttpServer()).get(`/admin/playlists/${ID}`)).status).toBe(404)
    })

    it('GET /admin/playlists/:id returns 400 for a non-UUID id', async () => {
      expect((await request(app.getHttpServer()).get('/admin/playlists/not-a-uuid')).status).toBe(
        400,
      )
    })
  })

  describe('with playlists:hide only', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminPlaylistsService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['playlists:hide']))
    })

    afterAll(() => app.close())

    beforeEach(() => {
      service.setVisibility.mockReset()
    })

    it('PATCH /admin/playlists/:id/visibility forwards isPublic and the optional reason', async () => {
      service.setVisibility.mockResolvedValue(buildAdminPlaylistRow({ isPublic: false }) as never)

      const res = await request(app.getHttpServer())
        .patch(`/admin/playlists/${ID}/visibility`)
        .send({ isPublic: false, reason: 'misleading' })

      expect(res.status).toBe(200)
      expect(service.setVisibility).toHaveBeenCalledWith(
        ID,
        false,
        'staff-1',
        'misleading',
        expect.any(Object),
      )
    })

    it('PATCH /admin/playlists/:id/visibility accepts isPublic: true to un-hide', async () => {
      service.setVisibility.mockResolvedValue(buildAdminPlaylistRow() as never)

      const res = await request(app.getHttpServer())
        .patch(`/admin/playlists/${ID}/visibility`)
        .send({ isPublic: true })

      expect(res.status).toBe(200)
      expect(service.setVisibility).toHaveBeenCalledWith(
        ID,
        true,
        'staff-1',
        undefined,
        expect.any(Object),
      )
    })

    it('PATCH /admin/playlists/:id/visibility returns 400 for a missing or non-boolean isPublic', async () => {
      const path = `/admin/playlists/${ID}/visibility`

      expect((await request(app.getHttpServer()).patch(path).send({})).status).toBe(400)
      expect((await request(app.getHttpServer()).patch(path).send({ isPublic: 'no' })).status).toBe(
        400,
      )
      expect(service.setVisibility).not.toHaveBeenCalled()
    })

    it('PATCH /admin/playlists/:id/visibility returns 409 when already private', async () => {
      service.setVisibility.mockRejectedValue(new PlaylistAlreadyHiddenException(ID))

      const res = await request(app.getHttpServer())
        .patch(`/admin/playlists/${ID}/visibility`)
        .send({ isPublic: false })

      expect(res.status).toBe(409)
    })

    it('PATCH /admin/playlists/:id/visibility returns 409 when un-hiding an owner-private playlist', async () => {
      service.setVisibility.mockRejectedValue(new PlaylistNotHiddenByOperatorException(ID))

      const res = await request(app.getHttpServer())
        .patch(`/admin/playlists/${ID}/visibility`)
        .send({ isPublic: true })

      expect(res.status).toBe(409)
    })

    it('PATCH /admin/playlists/:id/visibility returns 404 for an unknown playlist', async () => {
      service.setVisibility.mockRejectedValue(new PlaylistNotFoundException(ID))

      const res = await request(app.getHttpServer())
        .patch(`/admin/playlists/${ID}/visibility`)
        .send({ isPublic: false })

      expect(res.status).toBe(404)
    })

    it('does not grant take-down or restore', async () => {
      expect((await request(app.getHttpServer()).delete(`/admin/playlists/${ID}`)).status).toBe(403)
      expect(
        (await request(app.getHttpServer()).post(`/admin/playlists/${ID}/restore`)).status,
      ).toBe(403)
    })
  })

  describe('with playlists:delete and playlists:restore', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminPlaylistsService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['playlists:delete', 'playlists:restore']))
    })

    afterAll(() => app.close())

    beforeEach(() => {
      service.softDelete.mockReset()
      service.restore.mockReset()
    })

    it('DELETE /admin/playlists/:id returns 200 and forwards the optional reason', async () => {
      service.softDelete.mockResolvedValue(
        buildAdminPlaylistRow({ deletedAt: new Date() }) as never,
      )

      const res = await request(app.getHttpServer())
        .delete(`/admin/playlists/${ID}`)
        .send({ reason: 'spam' })

      expect(res.status).toBe(200)
      expect(service.softDelete).toHaveBeenCalledWith(ID, 'staff-1', 'spam', expect.any(Object))
    })

    it('DELETE /admin/playlists/:id returns 200 with no body at all', async () => {
      service.softDelete.mockResolvedValue(
        buildAdminPlaylistRow({ deletedAt: new Date() }) as never,
      )

      const res = await request(app.getHttpServer()).delete(`/admin/playlists/${ID}`)

      expect(res.status).toBe(200)
      expect(service.softDelete).toHaveBeenCalledWith(ID, 'staff-1', undefined, expect.any(Object))
    })

    it('DELETE /admin/playlists/:id returns 409 when already deleted', async () => {
      service.softDelete.mockRejectedValue(new PlaylistAlreadyDeletedException(ID))

      expect((await request(app.getHttpServer()).delete(`/admin/playlists/${ID}`)).status).toBe(409)
    })

    it('DELETE /admin/playlists/:id returns 404 for an unknown album', async () => {
      service.softDelete.mockRejectedValue(new PlaylistNotFoundException(ID))

      expect((await request(app.getHttpServer()).delete(`/admin/playlists/${ID}`)).status).toBe(404)
    })

    it('DELETE /admin/playlists/:id returns 400 when reason exceeds 500 characters', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/admin/playlists/${ID}`)
        .send({ reason: 'x'.repeat(501) })

      expect(res.status).toBe(400)
      expect(service.softDelete).not.toHaveBeenCalled()
    })

    it('POST /admin/playlists/:id/restore returns 200', async () => {
      service.restore.mockResolvedValue(buildAdminPlaylistRow({ deletedAt: null }) as never)

      expect(
        (await request(app.getHttpServer()).post(`/admin/playlists/${ID}/restore`)).status,
      ).toBe(200)
    })

    it('POST /admin/playlists/:id/restore returns 409 when not deleted', async () => {
      service.restore.mockRejectedValue(new PlaylistNotDeletedException(ID))

      expect(
        (await request(app.getHttpServer()).post(`/admin/playlists/${ID}/restore`)).status,
      ).toBe(409)
    })

    it('POST /admin/playlists/:id/restore returns 404 for an unknown album', async () => {
      service.restore.mockRejectedValue(new PlaylistNotFoundException(ID))

      expect(
        (await request(app.getHttpServer()).post(`/admin/playlists/${ID}/restore`)).status,
      ).toBe(404)
    })
  })

  describe('without the matching permissions', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminPlaylistsService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['playlists:read']))
    })

    afterAll(() => app.close())

    it('PATCH /admin/playlists/:id/visibility returns 403', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/admin/playlists/${ID}/visibility`)
        .send({ isPublic: false })

      expect(res.status).toBe(403)
      expect(service.setVisibility).not.toHaveBeenCalled()
    })

    it('DELETE /admin/playlists/:id returns 403', async () => {
      expect((await request(app.getHttpServer()).delete(`/admin/playlists/${ID}`)).status).toBe(403)
      expect(service.softDelete).not.toHaveBeenCalled()
    })

    it('POST /admin/playlists/:id/restore returns 403', async () => {
      expect(
        (await request(app.getHttpServer()).post(`/admin/playlists/${ID}/restore`)).status,
      ).toBe(403)
      expect(service.restore).not.toHaveBeenCalled()
    })
  })

  describe('without playlists:read', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminPlaylistsService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['playlists:delete']))
    })

    afterAll(() => app.close())

    it('GET /admin/playlists and /admin/playlists/:id return 403', async () => {
      expect((await request(app.getHttpServer()).get('/admin/playlists')).status).toBe(403)
      expect((await request(app.getHttpServer()).get(`/admin/playlists/${ID}`)).status).toBe(403)
      expect(service.findAll).not.toHaveBeenCalled()
    })
  })
})
