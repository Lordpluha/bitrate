import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AdminAuthGuard } from '@modules/admin-auth'
import type { INestApplication } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, type TestingModule } from '@nestjs/testing'
import { StubAdminAuthGuard } from '@test/mocks/stub-admin-auth.guard'
import request from 'supertest'
import { AdminModerationController } from './admin-moderation.controller'
import { AdminModerationService } from './admin-moderation.service'

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
  }) as unknown as jest.Mocked<AdminModerationService>

/**
 * Only the `sort`/`order` validation path — the happy-path list/get/update behaviour is
 * already covered by `admin-moderation.controller.unit-spec.ts` and
 * `admin-moderation.service.unit-spec.ts`. The 400s below need the real `ZodValidationPipe`
 * wired through HTTP, which the controller unit spec (calling methods directly) can't reach.
 */
describe('AdminModerationController (int)', () => {
  let app: INestApplication
  let service: jest.Mocked<AdminModerationService>

  beforeAll(async () => {
    service = makeServiceMock()
    const reflector = new Reflector()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminModerationController],
      providers: [{ provide: AdminModerationService, useValue: service }],
    })
      .overrideGuard(AdminAuthGuard)
      .useValue(new StubAdminAuthGuard(reflector, ['reports:read']))
      .compile()

    app = module.createNestApplication()
    await app.init()
  })

  afterAll(() => app.close())

  beforeEach(() => {
    service.findAll.mockReset()
  })

  it('GET /admin/moderation/reports returns 200', async () => {
    service.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as never)

    const res = await request(app.getHttpServer()).get('/admin/moderation/reports')

    expect(res.status).toBe(200)
  })

  it('GET /admin/moderation/reports returns 400 for a sort field outside the allowlist', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/moderation/reports')
      .query({ sort: 'reason' })

    expect(res.status).toBe(400)
    expect(service.findAll).not.toHaveBeenCalled()
  })

  it('GET /admin/moderation/reports returns 400 for an invalid order', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/moderation/reports')
      .query({ sort: 'status', order: 'sideways' })

    expect(res.status).toBe(400)
  })
})
