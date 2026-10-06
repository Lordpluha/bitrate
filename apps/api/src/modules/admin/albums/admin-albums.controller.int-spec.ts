import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AdminAuthGuard, type Permission } from '@modules/admin-auth'
import type { INestApplication } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, type TestingModule } from '@nestjs/testing'
import { StubAdminAuthGuard } from '@test/mocks/stub-admin-auth.guard'
import request from 'supertest'
import { buildAdminAlbumRow } from './__tests__/fixtures/admin-albums.fixtures'
import { AdminAlbumsController } from './admin-albums.controller'
import { AdminAlbumsService } from './admin-albums.service'
import {
  AlbumAlreadyDeletedException,
  AlbumNotDeletedException,
  AlbumNotFoundException,
} from './errors'

const ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findById: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
  }) as unknown as jest.Mocked<AdminAlbumsService>

const buildApp = async (permissions: Permission[]) => {
  const service = makeServiceMock()
  const module: TestingModule = await Test.createTestingModule({
    controllers: [AdminAlbumsController],
    providers: [{ provide: AdminAlbumsService, useValue: service }],
  })
    .overrideGuard(AdminAuthGuard)
    .useValue(new StubAdminAuthGuard(new Reflector(), permissions))
    .compile()

  const app = module.createNestApplication()
  await app.init()
  return { app, service }
}

describe('AdminAlbumsController (int)', () => {
  describe('with albums:read only', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminAlbumsService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['albums:read']))
    })

    afterAll(() => app.close())

    beforeEach(() => {
      service.findAll.mockReset()
      service.findById.mockReset()
    })

    it('GET /admin/albums returns 200 and forwards the parsed query', async () => {
      const row = buildAdminAlbumRow()
      service.findAll.mockResolvedValue({ data: [row], total: 1, page: 1, limit: 20 } as never)

      const res = await request(app.getHttpServer())
        .get('/admin/albums')
        .query({ status: 'deactivated', artistId: ID, q: 'night', sort: 'title', order: 'asc' })

      expect(res.status).toBe(200)
      expect(res.body).toEqual(
        JSON.parse(JSON.stringify({ data: [row], total: 1, page: 1, limit: 20 })),
      )
      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'deactivated',
          artistId: ID,
          q: 'night',
          sort: 'title',
          order: 'asc',
        }),
      )
    })

    it('GET /admin/albums returns 400 for a sort field outside the allowlist', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/albums')
        .query({ sort: 'description' })

      expect(res.status).toBe(400)
      expect(service.findAll).not.toHaveBeenCalled()
    })

    it('GET /admin/albums returns 400 for an invalid status or artistId', async () => {
      expect(
        (await request(app.getHttpServer()).get('/admin/albums').query({ status: 'bogus' })).status,
      ).toBe(400)
      expect(
        (await request(app.getHttpServer()).get('/admin/albums').query({ artistId: 'nope' }))
          .status,
      ).toBe(400)
    })

    it('GET /admin/albums/:id returns 200', async () => {
      service.findById.mockResolvedValue({ ...buildAdminAlbumRow(), tracks: [] } as never)

      const res = await request(app.getHttpServer()).get(`/admin/albums/${ID}`)

      expect(res.status).toBe(200)
      expect(service.findById).toHaveBeenCalledWith(ID)
    })

    it('GET /admin/albums/:id returns 404 for an unknown album', async () => {
      service.findById.mockRejectedValue(new AlbumNotFoundException(ID))

      expect((await request(app.getHttpServer()).get(`/admin/albums/${ID}`)).status).toBe(404)
    })

    it('GET /admin/albums/:id returns 400 for a non-UUID id', async () => {
      expect((await request(app.getHttpServer()).get('/admin/albums/not-a-uuid')).status).toBe(400)
    })
  })

  describe('with albums:delete and albums:restore', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminAlbumsService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['albums:delete', 'albums:restore']))
    })

    afterAll(() => app.close())

    beforeEach(() => {
      service.softDelete.mockReset()
      service.restore.mockReset()
    })

    it('DELETE /admin/albums/:id returns 200 and forwards the optional reason', async () => {
      service.softDelete.mockResolvedValue(buildAdminAlbumRow({ deletedAt: new Date() }) as never)

      const res = await request(app.getHttpServer())
        .delete(`/admin/albums/${ID}`)
        .send({ reason: 'rights claim' })

      expect(res.status).toBe(200)
      expect(service.softDelete).toHaveBeenCalledWith(
        ID,
        'staff-1',
        'rights claim',
        expect.any(Object),
      )
    })

    it('DELETE /admin/albums/:id returns 200 with no body at all', async () => {
      service.softDelete.mockResolvedValue(buildAdminAlbumRow({ deletedAt: new Date() }) as never)

      const res = await request(app.getHttpServer()).delete(`/admin/albums/${ID}`)

      expect(res.status).toBe(200)
      expect(service.softDelete).toHaveBeenCalledWith(ID, 'staff-1', undefined, expect.any(Object))
    })

    it('DELETE /admin/albums/:id returns 409 when already deleted', async () => {
      service.softDelete.mockRejectedValue(new AlbumAlreadyDeletedException(ID))

      expect((await request(app.getHttpServer()).delete(`/admin/albums/${ID}`)).status).toBe(409)
    })

    it('DELETE /admin/albums/:id returns 404 for an unknown album', async () => {
      service.softDelete.mockRejectedValue(new AlbumNotFoundException(ID))

      expect((await request(app.getHttpServer()).delete(`/admin/albums/${ID}`)).status).toBe(404)
    })

    it('DELETE /admin/albums/:id returns 400 when reason exceeds 500 characters', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/admin/albums/${ID}`)
        .send({ reason: 'x'.repeat(501) })

      expect(res.status).toBe(400)
      expect(service.softDelete).not.toHaveBeenCalled()
    })

    it('POST /admin/albums/:id/restore returns 200', async () => {
      service.restore.mockResolvedValue(buildAdminAlbumRow({ deletedAt: null }) as never)

      expect((await request(app.getHttpServer()).post(`/admin/albums/${ID}/restore`)).status).toBe(
        200,
      )
    })

    it('POST /admin/albums/:id/restore returns 409 when not deleted', async () => {
      service.restore.mockRejectedValue(new AlbumNotDeletedException(ID))

      expect((await request(app.getHttpServer()).post(`/admin/albums/${ID}/restore`)).status).toBe(
        409,
      )
    })

    it('POST /admin/albums/:id/restore returns 404 for an unknown album', async () => {
      service.restore.mockRejectedValue(new AlbumNotFoundException(ID))

      expect((await request(app.getHttpServer()).post(`/admin/albums/${ID}/restore`)).status).toBe(
        404,
      )
    })
  })

  describe('without the matching permissions', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminAlbumsService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['albums:read']))
    })

    afterAll(() => app.close())

    it('DELETE /admin/albums/:id returns 403', async () => {
      expect((await request(app.getHttpServer()).delete(`/admin/albums/${ID}`)).status).toBe(403)
      expect(service.softDelete).not.toHaveBeenCalled()
    })

    it('POST /admin/albums/:id/restore returns 403', async () => {
      expect((await request(app.getHttpServer()).post(`/admin/albums/${ID}/restore`)).status).toBe(
        403,
      )
      expect(service.restore).not.toHaveBeenCalled()
    })
  })

  describe('without albums:read', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminAlbumsService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['albums:delete']))
    })

    afterAll(() => app.close())

    it('GET /admin/albums and /admin/albums/:id return 403', async () => {
      expect((await request(app.getHttpServer()).get('/admin/albums')).status).toBe(403)
      expect((await request(app.getHttpServer()).get(`/admin/albums/${ID}`)).status).toBe(403)
      expect(service.findAll).not.toHaveBeenCalled()
    })
  })
})
