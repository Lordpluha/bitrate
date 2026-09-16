import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AdminAuthGuard, type Permission } from '@modules/admin-auth'
import type { INestApplication } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, type TestingModule } from '@nestjs/testing'
import { StubAdminAuthGuard } from '@test/mocks/stub-admin-auth.guard'
import request from 'supertest'
import { buildAdminUser } from './__tests__/fixtures/admin-users.fixtures'
import { AdminUsersController } from './admin-users.controller'
import { AdminUsersService } from './admin-users.service'
import { UserNotFoundException } from './errors'

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findById: jest.fn(),
    softDelete: jest.fn(),
  }) as unknown as jest.Mocked<AdminUsersService>

const buildApp = async (permissions: Permission[]) => {
  const service = makeServiceMock()
  const reflector = new Reflector()

  const module: TestingModule = await Test.createTestingModule({
    controllers: [AdminUsersController],
    providers: [{ provide: AdminUsersService, useValue: service }],
  })
    .overrideGuard(AdminAuthGuard)
    .useValue(new StubAdminAuthGuard(reflector, permissions))
    .compile()

  const app = module.createNestApplication()
  await app.init()
  return { app, service }
}

describe('AdminUsersController (int)', () => {
  describe('with users:read only', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminUsersService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['users:read']))
    })

    afterAll(() => app.close())

    beforeEach(() => {
      service.findAll.mockReset()
      service.findById.mockReset()
      service.softDelete.mockReset()
    })

    it('GET /admin/users returns 200', async () => {
      const user = buildAdminUser()
      service.findAll.mockResolvedValue({ data: [user], total: 1, page: 1, limit: 20 } as never)

      const res = await request(app.getHttpServer()).get('/admin/users')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(
        JSON.parse(JSON.stringify({ data: [user], total: 1, page: 1, limit: 20 })),
      )
    })

    it('GET /admin/users/:id returns 404 for a missing user', async () => {
      service.findById.mockRejectedValue(new UserNotFoundException('missing'))

      const res = await request(app.getHttpServer()).get(
        '/admin/users/f47ac10b-58cc-4372-a567-0e02b2c3d479',
      )

      expect(res.status).toBe(404)
    })

    it('DELETE /admin/users/:id returns 403 — missing users:delete', async () => {
      const res = await request(app.getHttpServer()).delete(
        '/admin/users/f47ac10b-58cc-4372-a567-0e02b2c3d479',
      )

      expect(res.status).toBe(403)
      expect(service.softDelete).not.toHaveBeenCalled()
    })

    it('GET /admin/users/:id returns 400 for a non-UUID id', async () => {
      const res = await request(app.getHttpServer()).get('/admin/users/not-a-uuid')

      expect(res.status).toBe(400)
    })
  })

  describe('with users:delete', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminUsersService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['users:read', 'users:delete']))
    })

    afterAll(() => app.close())

    beforeEach(() => {
      service.softDelete.mockReset()
    })

    it('DELETE /admin/users/:id returns 200 and soft-deletes', async () => {
      const user = buildAdminUser({ deletedAt: new Date() })
      service.softDelete.mockResolvedValue(user as never)

      const res = await request(app.getHttpServer()).delete(
        '/admin/users/f47ac10b-58cc-4372-a567-0e02b2c3d479',
      )

      expect(res.status).toBe(200)
      expect(service.softDelete).toHaveBeenCalledWith('f47ac10b-58cc-4372-a567-0e02b2c3d479')
    })
  })
})
