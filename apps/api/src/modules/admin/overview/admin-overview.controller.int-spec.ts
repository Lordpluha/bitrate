import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AdminAuthGuard, type Permission } from '@modules/admin-auth'
import type { CanActivate, INestApplication } from '@nestjs/common'
import { UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, type TestingModule } from '@nestjs/testing'
import { StubAdminAuthGuard } from '@test/mocks/stub-admin-auth.guard'
import request from 'supertest'
import { AdminOverviewController } from './admin-overview.controller'
import { AdminOverviewService } from './admin-overview.service'

/** Simulates a request with no staff session at all — the guard's own outcome with no cookie. */
class NoSessionGuard implements CanActivate {
  canActivate(): boolean {
    throw new UnauthorizedException('Access token required')
  }
}

const OVERVIEW_RESPONSE = {
  reports: { open: 0, reviewing: 0 },
  tracks: { processing: 0, ready: 0, failed: 0, stuck: 0, stuckAfterMs: 1_800_000 },
  deactivated: { users: 0, artists: 0 },
  last7Days: { signups: 0, uploads: 0 },
  recentActivity: [],
}

const makeServiceMock = () =>
  ({
    getOverview: jest.fn(),
  }) as unknown as jest.Mocked<AdminOverviewService>

const buildApp = async (permissions: Permission[]) => {
  const service = makeServiceMock()
  const reflector = new Reflector()

  const module: TestingModule = await Test.createTestingModule({
    controllers: [AdminOverviewController],
    providers: [{ provide: AdminOverviewService, useValue: service }],
  })
    .overrideGuard(AdminAuthGuard)
    .useValue(new StubAdminAuthGuard(reflector, permissions))
    .compile()

  const app = module.createNestApplication()
  await app.init()
  return { app, service }
}

describe('AdminOverviewController (int)', () => {
  describe('without overview:read', () => {
    let app: INestApplication

    beforeAll(async () => {
      ;({ app } = await buildApp([]))
    })

    afterAll(() => app.close())

    it('GET /admin/overview returns 403', async () => {
      const res = await request(app.getHttpServer()).get('/admin/overview')

      expect(res.status).toBe(403)
    })
  })

  describe('with overview:read', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminOverviewService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp(['overview:read']))
    })

    afterAll(() => app.close())

    beforeEach(() => {
      service.getOverview.mockReset()
    })

    it('GET /admin/overview returns 200 with the aggregate summary', async () => {
      service.getOverview.mockResolvedValue(OVERVIEW_RESPONSE as never)

      const res = await request(app.getHttpServer()).get('/admin/overview')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(OVERVIEW_RESPONSE)
    })
  })

  describe('without a staff session', () => {
    it('GET /admin/overview returns 401', async () => {
      const service = makeServiceMock()
      const module: TestingModule = await Test.createTestingModule({
        controllers: [AdminOverviewController],
        providers: [{ provide: AdminOverviewService, useValue: service }],
      })
        .overrideGuard(AdminAuthGuard)
        .useValue(new NoSessionGuard())
        .compile()

      const app = module.createNestApplication()
      await app.init()

      const res = await request(app.getHttpServer()).get('/admin/overview')

      expect(res.status).toBe(401)
      await app.close()
    })
  })
})
