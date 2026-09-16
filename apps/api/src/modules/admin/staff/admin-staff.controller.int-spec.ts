import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AdminAuthGuard, type Permission, ProtectedPermissionException } from '@modules/admin-auth'
import type { INestApplication } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, type TestingModule } from '@nestjs/testing'
import { StubAdminAuthGuard } from '@test/mocks/stub-admin-auth.guard'
import request from 'supertest'
import { AdminStaffController } from './admin-staff.controller'
import { AdminStaffService } from './admin-staff.service'
import { StaffNotFoundException } from './errors'

const STAFF_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    assignRole: jest.fn(),
    updatePermissions: jest.fn(),
    softDelete: jest.fn(),
  }) as unknown as jest.Mocked<AdminStaffService>

const buildApp = async (permissions: Permission[]) => {
  const service = makeServiceMock()
  const reflector = new Reflector()

  const module: TestingModule = await Test.createTestingModule({
    controllers: [AdminStaffController],
    providers: [{ provide: AdminStaffService, useValue: service }],
  })
    .overrideGuard(AdminAuthGuard)
    .useValue(new StubAdminAuthGuard(reflector, permissions))
    .compile()

  const app = module.createNestApplication()
  await app.init()
  return { app, service }
}

describe('AdminStaffController (int)', () => {
  describe('with staff:read only', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminStaffService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['staff:read']))
    })

    afterAll(() => app.close())

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('GET /admin/staff returns 200', async () => {
      service.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as never)

      const res = await request(app.getHttpServer()).get('/admin/staff')

      expect(res.status).toBe(200)
    })

    it('GET /admin/staff/:id returns 404 for a missing operator', async () => {
      service.findById.mockRejectedValue(new StaffNotFoundException('missing') as never)

      const res = await request(app.getHttpServer()).get(`/admin/staff/${STAFF_ID}`)

      expect(res.status).toBe(404)
    })

    it('POST /admin/staff returns 403 — missing staff:write', async () => {
      const res = await request(app.getHttpServer()).post('/admin/staff').send({
        email: 'new@bitrate.app',
        username: 'newop',
        password: 'a-strong-password-12',
        roleId: STAFF_ID,
      })

      expect(res.status).toBe(403)
      expect(service.create).not.toHaveBeenCalled()
    })

    it('PATCH /admin/staff/:id/role returns 403 — missing staff:write', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/admin/staff/${STAFF_ID}/role`)
        .send({ roleId: STAFF_ID })

      expect(res.status).toBe(403)
      expect(service.assignRole).not.toHaveBeenCalled()
    })

    it('PATCH /admin/staff/:id/permissions returns 403 — missing staff:write', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/admin/staff/${STAFF_ID}/permissions`)
        .send({ permissions: [] })

      expect(res.status).toBe(403)
      expect(service.updatePermissions).not.toHaveBeenCalled()
    })

    it('DELETE /admin/staff/:id returns 403 — missing staff:write', async () => {
      const res = await request(app.getHttpServer()).delete(`/admin/staff/${STAFF_ID}`)

      expect(res.status).toBe(403)
      expect(service.softDelete).not.toHaveBeenCalled()
    })
  })

  describe('with staff:write', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminStaffService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['staff:read', 'staff:write']))
    })

    afterAll(() => app.close())

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('PATCH /admin/staff/:id/permissions returns 400 for a protected permission', async () => {
      service.updatePermissions.mockRejectedValue(
        new ProtectedPermissionException(['staff:write']) as never,
      )

      const res = await request(app.getHttpServer())
        .patch(`/admin/staff/${STAFF_ID}/permissions`)
        .send({ permissions: ['staff:write'] })

      expect(res.status).toBe(400)
    })

    it('PATCH /admin/staff/:id/permissions returns 200 and delegates', async () => {
      service.updatePermissions.mockResolvedValue({ id: STAFF_ID } as never)

      const res = await request(app.getHttpServer())
        .patch(`/admin/staff/${STAFF_ID}/permissions`)
        .send({ permissions: ['tracks:read'] })

      expect(res.status).toBe(200)
      expect(service.updatePermissions).toHaveBeenCalledWith(
        STAFF_ID,
        { permissions: ['tracks:read'] },
        'staff-1',
      )
    })

    it('DELETE /admin/staff/:id returns 200', async () => {
      service.softDelete.mockResolvedValue({ id: STAFF_ID } as never)

      const res = await request(app.getHttpServer()).delete(`/admin/staff/${STAFF_ID}`)

      expect(res.status).toBe(200)
    })
  })
})
