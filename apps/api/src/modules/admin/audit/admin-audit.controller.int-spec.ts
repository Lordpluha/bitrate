import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AdminAuthGuard, REQUIRED_ROLES } from '@modules/admin-auth'
import type { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, type TestingModule } from '@nestjs/testing'
import type { StaffRole } from '@prisma/client'
import request from 'supertest'
import { buildAuditLog } from './__tests__/fixtures/admin-audit.fixtures'
import { AdminAuditController } from './admin-audit.controller'
import { AdminAuditService } from './admin-audit.service'

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
  }) as unknown as jest.Mocked<AdminAuditService>

/** Simulates the real guard's role check off the real `@AdminAuth(...)` metadata. */
class StubAdminAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly staffRole: StaffRole,
  ) {}

  canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<StaffRole[]>(REQUIRED_ROLES, [
      context.getHandler(),
      context.getClass(),
    ])
    if (roles && roles.length > 0 && !roles.includes(this.staffRole)) {
      return false
    }
    ;(context.switchToHttp().getRequest() as Record<string, unknown>).staff = {
      id: 'staff-1',
      role: this.staffRole,
    }
    return true
  }
}

describe('AdminAuditController (int)', () => {
  let app: INestApplication
  let service: jest.Mocked<AdminAuditService>

  beforeAll(async () => {
    service = makeServiceMock()
    const reflector = new Reflector()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAuditController],
      providers: [{ provide: AdminAuditService, useValue: service }],
    })
      .overrideGuard(AdminAuthGuard)
      .useValue(new StubAdminAuthGuard(reflector, 'MODERATOR'))
      .compile()

    app = module.createNestApplication()
    await app.init()
  })

  afterAll(() => app.close())

  beforeEach(() => {
    service.findAll.mockReset()
  })

  it('GET /admin/audit returns 200 with a resolved actor username, available to MODERATOR', async () => {
    const row = { ...buildAuditLog(), actorUsername: 'ops' }
    service.findAll.mockResolvedValue({ data: [row], total: 1, page: 1, limit: 20 } as never)

    const res = await request(app.getHttpServer()).get('/admin/audit')

    expect(res.status).toBe(200)
    expect(res.body).toEqual(
      JSON.parse(JSON.stringify({ data: [row], total: 1, page: 1, limit: 20 })),
    )
  })

  it('GET /admin/audit returns 400 when `from` is after `to`', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/audit')
      .query({ from: '2026-02-01', to: '2026-01-01' })

    expect(res.status).toBe(400)
    expect(service.findAll).not.toHaveBeenCalled()
  })

  it('GET /admin/audit returns 400 for a non-UUID staffId', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/audit')
      .query({ staffId: 'not-a-uuid' })

    expect(res.status).toBe(400)
  })

  it('GET /admin/audit returns an empty page beyond the data', async () => {
    service.findAll.mockResolvedValue({ data: [], total: 0, page: 5, limit: 20 } as never)

    const res = await request(app.getHttpServer()).get('/admin/audit').query({ page: 5 })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: [], total: 0, page: 5, limit: 20 })
  })
})
