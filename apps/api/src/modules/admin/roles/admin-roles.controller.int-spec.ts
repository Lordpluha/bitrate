import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AdminAuthGuard, type Permission, ProtectedPermissionException } from '@modules/admin-auth'
import type { INestApplication } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, type TestingModule } from '@nestjs/testing'
import { StubAdminAuthGuard } from '@test/mocks/stub-admin-auth.guard'
import request from 'supertest'
import { AdminRolesController } from './admin-roles.controller'
import { AdminRolesService } from './admin-roles.service'
import { RoleNotFoundException } from './errors'

const ROLE_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findById: jest.fn(),
    permissionsCatalogue: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }) as unknown as jest.Mocked<AdminRolesService>

const buildApp = async (permissions: Permission[]) => {
  const service = makeServiceMock()
  const reflector = new Reflector()

  const module: TestingModule = await Test.createTestingModule({
    controllers: [AdminRolesController],
    providers: [{ provide: AdminRolesService, useValue: service }],
  })
    .overrideGuard(AdminAuthGuard)
    .useValue(new StubAdminAuthGuard(reflector, permissions))
    .compile()

  const app = module.createNestApplication()
  await app.init()
  return { app, service }
}

describe('AdminRolesController (int)', () => {
  describe('with roles:read only', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminRolesService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['roles:read']))
    })

    afterAll(() => app.close())

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('GET /admin/roles returns 200', async () => {
      service.findAll.mockResolvedValue([] as never)

      const res = await request(app.getHttpServer()).get('/admin/roles')

      expect(res.status).toBe(200)
    })

    it('GET /admin/roles/permissions returns 200', async () => {
      service.permissionsCatalogue.mockResolvedValue([] as never)

      const res = await request(app.getHttpServer()).get('/admin/roles/permissions')

      expect(res.status).toBe(200)
    })

    it('GET /admin/roles/:id returns 404 for a missing role', async () => {
      service.findById.mockRejectedValue(new RoleNotFoundException('missing') as never)

      const res = await request(app.getHttpServer()).get(`/admin/roles/${ROLE_ID}`)

      expect(res.status).toBe(404)
    })

    it('POST /admin/roles returns 403 — missing roles:write', async () => {
      const res = await request(app.getHttpServer())
        .post('/admin/roles')
        .send({ name: 'Support', permissions: [] })

      expect(res.status).toBe(403)
      expect(service.create).not.toHaveBeenCalled()
    })

    it('PATCH /admin/roles/:id returns 403 — missing roles:write', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/admin/roles/${ROLE_ID}`)
        .send({ permissions: [] })

      expect(res.status).toBe(403)
      expect(service.update).not.toHaveBeenCalled()
    })

    it('DELETE /admin/roles/:id returns 403 — missing roles:write', async () => {
      const res = await request(app.getHttpServer()).delete(`/admin/roles/${ROLE_ID}`)

      expect(res.status).toBe(403)
      expect(service.remove).not.toHaveBeenCalled()
    })
  })

  describe('with roles:write', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminRolesService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['roles:read', 'roles:write']))
    })

    afterAll(() => app.close())

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('POST /admin/roles returns 400 for a protected permission', async () => {
      service.create.mockRejectedValue(new ProtectedPermissionException(['staff:write']) as never)

      const res = await request(app.getHttpServer())
        .post('/admin/roles')
        .send({ name: 'Support', permissions: ['staff:write'] })

      expect(res.status).toBe(400)
    })

    it('POST /admin/roles returns 201 and creates', async () => {
      service.create.mockResolvedValue({ id: ROLE_ID } as never)

      const res = await request(app.getHttpServer())
        .post('/admin/roles')
        .send({ name: 'Support', permissions: ['tracks:read'] })

      expect(res.status).toBe(201)
      expect(service.create).toHaveBeenCalledWith({ name: 'Support', permissions: ['tracks:read'] })
    })

    it('DELETE /admin/roles/:id returns 200', async () => {
      service.remove.mockResolvedValue({ id: ROLE_ID } as never)

      const res = await request(app.getHttpServer()).delete(`/admin/roles/${ROLE_ID}`)

      expect(res.status).toBe(200)
    })
  })
})
