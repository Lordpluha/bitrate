import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AdminAuthGuard, REQUIRED_ROLES } from '@modules/admin-auth'
import type { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, type TestingModule } from '@nestjs/testing'
import type { StaffRole } from '@prisma/client'
import request from 'supertest'
import { buildAdminArtist } from './__tests__/fixtures/admin-artists.fixtures'
import { AdminArtistsController } from './admin-artists.controller'
import { AdminArtistsService } from './admin-artists.service'
import { ArtistNotFoundException } from './errors'

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findById: jest.fn(),
    updateVerification: jest.fn(),
    softDelete: jest.fn(),
  }) as unknown as jest.Mocked<AdminArtistsService>

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
    controllers: [AdminArtistsController],
    providers: [{ provide: AdminArtistsService, useValue: service }],
  })
    .overrideGuard(AdminAuthGuard)
    .useValue(new StubAdminAuthGuard(reflector, staffRole))
    .compile()

  const app = module.createNestApplication()
  await app.init()
  return { app, service }
}

describe('AdminArtistsController (int)', () => {
  describe('as MODERATOR', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminArtistsService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp('MODERATOR'))
    })

    afterAll(() => app.close())

    beforeEach(() => {
      service.findAll.mockReset()
      service.findById.mockReset()
      service.updateVerification.mockReset()
      service.softDelete.mockReset()
    })

    it('GET /admin/artists returns 200', async () => {
      const artist = buildAdminArtist()
      service.findAll.mockResolvedValue({ data: [artist], total: 1, page: 1, limit: 20 } as never)

      const res = await request(app.getHttpServer()).get('/admin/artists')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(
        JSON.parse(JSON.stringify({ data: [artist], total: 1, page: 1, limit: 20 })),
      )
    })

    it('GET /admin/artists/:id returns 404 for a missing artist', async () => {
      service.findById.mockRejectedValue(new ArtistNotFoundException('missing'))

      const res = await request(app.getHttpServer()).get(
        '/admin/artists/f47ac10b-58cc-4372-a567-0e02b2c3d479',
      )

      expect(res.status).toBe(404)
    })

    it('PATCH /admin/artists/:id/verification returns 403 — read-only role', async () => {
      const res = await request(app.getHttpServer())
        .patch('/admin/artists/f47ac10b-58cc-4372-a567-0e02b2c3d479/verification')
        .send({ verified: true })

      expect(res.status).toBe(403)
      expect(service.updateVerification).not.toHaveBeenCalled()
    })

    it('DELETE /admin/artists/:id returns 403 — read-only role', async () => {
      const res = await request(app.getHttpServer()).delete(
        '/admin/artists/f47ac10b-58cc-4372-a567-0e02b2c3d479',
      )

      expect(res.status).toBe(403)
      expect(service.softDelete).not.toHaveBeenCalled()
    })
  })

  describe('as ADMIN', () => {
    let app: INestApplication
    let service: jest.Mocked<AdminArtistsService>

    beforeAll(async () => {
      ;({ app, service } = await buildApp('ADMIN'))
    })

    afterAll(() => app.close())

    beforeEach(() => {
      service.updateVerification.mockReset()
      service.softDelete.mockReset()
    })

    it('PATCH /admin/artists/:id/verification returns 200', async () => {
      const artist = buildAdminArtist({ verified: true })
      service.updateVerification.mockResolvedValue(artist as never)

      const res = await request(app.getHttpServer())
        .patch('/admin/artists/f47ac10b-58cc-4372-a567-0e02b2c3d479/verification')
        .send({ verified: true })

      expect(res.status).toBe(200)
      expect(service.updateVerification).toHaveBeenCalledWith(
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        { verified: true },
      )
    })

    it('PATCH /admin/artists/:id/verification returns 400 for an invalid body', async () => {
      const res = await request(app.getHttpServer())
        .patch('/admin/artists/f47ac10b-58cc-4372-a567-0e02b2c3d479/verification')
        .send({ verified: 'yes' })

      expect(res.status).toBe(400)
    })

    it('DELETE /admin/artists/:id returns 200 and soft-deletes', async () => {
      const artist = buildAdminArtist({ deletedAt: new Date() })
      service.softDelete.mockResolvedValue(artist as never)

      const res = await request(app.getHttpServer()).delete(
        '/admin/artists/f47ac10b-58cc-4372-a567-0e02b2c3d479',
      )

      expect(res.status).toBe(200)
      expect(service.softDelete).toHaveBeenCalledWith('f47ac10b-58cc-4372-a567-0e02b2c3d479')
    })

    it('GET /admin/artists/:id returns 400 for a non-UUID id', async () => {
      const res = await request(app.getHttpServer()).get('/admin/artists/not-a-uuid')

      expect(res.status).toBe(400)
    })
  })
})
