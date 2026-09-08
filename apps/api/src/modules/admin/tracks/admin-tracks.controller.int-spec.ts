import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AdminAuthGuard, REQUIRED_ROLES } from '@modules/admin-auth'
import type { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, type TestingModule } from '@nestjs/testing'
import type { StaffRole } from '@prisma/client'
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

const buildApp = async (staffRole: StaffRole) => {
  const service = makeServiceMock()
  const reflector = new Reflector()

  const module: TestingModule = await Test.createTestingModule({
    controllers: [AdminTracksController],
    providers: [{ provide: AdminTracksService, useValue: service }],
  })
    .overrideGuard(AdminAuthGuard)
    .useValue(new StubAdminAuthGuard(reflector, staffRole))
    .compile()

  const app = module.createNestApplication()
  await app.init()
  return { app, service }
}

describe('AdminTracksController (int)', () => {
  describe('as MODERATOR', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminTracksService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp('MODERATOR'))
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

    it('GET /admin/tracks/:id returns 404 for a missing track', async () => {
      service.findById.mockRejectedValue(new TrackNotFoundException('missing'))

      const res = await request(app.getHttpServer()).get(
        '/admin/tracks/f47ac10b-58cc-4372-a567-0e02b2c3d479',
      )

      expect(res.status).toBe(404)
    })

    it('POST /admin/tracks/:id/reprocess returns 403 — read-only role', async () => {
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

  describe('as ADMIN', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminTracksService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp('ADMIN'))
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
