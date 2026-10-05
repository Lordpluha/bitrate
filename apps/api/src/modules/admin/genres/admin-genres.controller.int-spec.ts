import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AdminAuthGuard, type Permission } from '@modules/admin-auth'
import type { INestApplication } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, type TestingModule } from '@nestjs/testing'
import { StubAdminAuthGuard } from '@test/mocks/stub-admin-auth.guard'
import request from 'supertest'
import { AdminGenresController } from './admin-genres.controller'
import { AdminGenresService } from './admin-genres.service'
import { GenreInUseException, GenreSlugTakenException } from './errors'

const GENRE_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }) as unknown as jest.Mocked<AdminGenresService>

const buildApp = async (permissions: Permission[]) => {
  const service = makeServiceMock()

  const module: TestingModule = await Test.createTestingModule({
    controllers: [AdminGenresController],
    providers: [{ provide: AdminGenresService, useValue: service }],
  })
    .overrideGuard(AdminAuthGuard)
    .useValue(new StubAdminAuthGuard(new Reflector(), permissions))
    .compile()

  const app = module.createNestApplication()
  await app.init()
  return { app, service }
}

describe('AdminGenresController (int)', () => {
  describe('with genres:read only', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminGenresService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['genres:read']))
    })
    afterAll(() => app.close())
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('GET /admin/genres returns 200', async () => {
      service.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as never)

      const res = await request(app.getHttpServer()).get('/admin/genres')

      expect(res.status).toBe(200)
    })

    it('POST /admin/genres returns 403 — missing genres:write', async () => {
      const res = await request(app.getHttpServer()).post('/admin/genres').send({ name: 'Pop' })

      expect(res.status).toBe(403)
      expect(service.create).not.toHaveBeenCalled()
    })

    it('PATCH /admin/genres/:id returns 403 — missing genres:write', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/admin/genres/${GENRE_ID}`)
        .send({ name: 'Pop' })

      expect(res.status).toBe(403)
      expect(service.update).not.toHaveBeenCalled()
    })

    it('DELETE /admin/genres/:id returns 403 — missing genres:delete', async () => {
      const res = await request(app.getHttpServer()).delete(`/admin/genres/${GENRE_ID}`)

      expect(res.status).toBe(403)
      expect(service.remove).not.toHaveBeenCalled()
    })
  })

  describe('with genres:read, genres:write and genres:delete', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminGenresService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['genres:read', 'genres:write', 'genres:delete']))
    })
    afterAll(() => app.close())
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('POST /admin/genres returns 201 and passes the body through', async () => {
      service.create.mockResolvedValue({ id: GENRE_ID } as never)

      const res = await request(app.getHttpServer())
        .post('/admin/genres')
        .send({ name: 'Pop', color: '#112233' })

      expect(res.status).toBe(201)
      expect(service.create).toHaveBeenCalledWith({ name: 'Pop', color: '#112233' })
    })

    it.each(['red', '#12345', '#1234567', '112233'])(
      'POST /admin/genres returns 400 for the colour %s',
      async (color) => {
        const res = await request(app.getHttpServer())
          .post('/admin/genres')
          .send({ name: 'Pop', color })

        expect(res.status).toBe(400)
        expect(service.create).not.toHaveBeenCalled()
      },
    )

    it('POST /admin/genres returns 409 for a taken slug', async () => {
      service.create.mockRejectedValue(new GenreSlugTakenException('pop') as never)

      const res = await request(app.getHttpServer())
        .post('/admin/genres')
        .send({ name: 'Pop', slug: 'pop' })

      expect(res.status).toBe(409)
    })

    it('DELETE /admin/genres/:id returns 409 with the reference counts', async () => {
      service.remove.mockRejectedValue(
        new GenreInUseException(GENRE_ID, { tracks: 2, albums: 1, artists: 0 }) as never,
      )

      const res = await request(app.getHttpServer()).delete(`/admin/genres/${GENRE_ID}`)

      expect(res.status).toBe(409)
      expect(res.body).toMatchObject({ counts: { tracks: 2, albums: 1, artists: 0 } })
    })
  })
})
