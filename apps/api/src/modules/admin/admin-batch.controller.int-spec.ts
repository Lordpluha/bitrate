import { AuditInterceptor } from '@infra/observability/audit.interceptor'
import { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AdminAuthGuard, type Permission } from '@modules/admin-auth'
import type { INestApplication, Type } from '@nestjs/common'
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core'
import { Test } from '@nestjs/testing'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { StubAdminAuthGuard } from '@test/mocks/stub-admin-auth.guard'
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended'
import request from 'supertest'

/** `TrackUploadService` pulls in `music-metadata` via `track-media.ts`; that package
 * cannot be resolved under Jest, so every spec that reaches it mocks it virtually. */
jest.mock('music-metadata', () => ({ parseFile: jest.fn() }), { virtual: true })

import { AdminModerationController } from './moderation/admin-moderation.controller'
import { AdminModerationService } from './moderation/admin-moderation.service'
import { buildTrack, buildTrackWithArtist } from './tracks/__tests__/fixtures/admin-tracks.fixtures'
import { AdminTrackAudioService } from './tracks/admin-track-audio.service'
import { AdminTracksController } from './tracks/admin-tracks.controller'
import { AdminTracksService } from './tracks/admin-tracks.service'
import { AdminUsersController } from './users/admin-users.controller'
import { AdminUsersService } from './users/admin-users.service'

const ID_A = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
const ID_B = 'a1b2c3d4-58cc-4372-a567-0e02b2c3d479'
const BATCH_RESULT = {
  results: [
    { id: ID_A, status: 'succeeded' },
    {
      id: ID_B,
      status: 'failed',
      error: { code: 'CONFLICT', message: 'already' },
    },
  ],
  total: 2,
  succeeded: 1,
  failed: 1,
}

type BatchRoute = {
  name: string
  url: string
  permission: Permission
  controller: Type
  service: Type
  method: string
  /** Extra arguments the service receives after the ids, before the audit context. */
  extra: unknown[]
}

const ROUTES: BatchRoute[] = [
  {
    name: 'reports resolve',
    url: '/admin/moderation/reports/batch/resolve',
    permission: 'reports:advance',
    controller: AdminModerationController,
    service: AdminModerationService,
    method: 'advanceMany',
    extra: ['RESOLVED', 'staff-1'],
  },
  {
    name: 'reports dismiss',
    url: '/admin/moderation/reports/batch/dismiss',
    permission: 'reports:advance',
    controller: AdminModerationController,
    service: AdminModerationService,
    method: 'advanceMany',
    extra: ['REJECTED', 'staff-1'],
  },
  {
    name: 'tracks take-down',
    url: '/admin/tracks/batch/take-down',
    permission: 'tracks:delete',
    controller: AdminTracksController,
    service: AdminTracksService,
    method: 'softDeleteMany',
    extra: ['staff-1'],
  },
  {
    name: 'users deactivate',
    url: '/admin/users/batch/deactivate',
    permission: 'users:delete',
    controller: AdminUsersController,
    service: AdminUsersService,
    method: 'softDeleteMany',
    extra: ['staff-1'],
  },
]

const buildApp = async (route: BatchRoute, permissions: Permission[]) => {
  const service = { [route.method]: jest.fn() }
  const module = await Test.createTestingModule({
    controllers: [route.controller],
    providers: [
      { provide: route.service, useValue: service },
      { provide: AdminTrackAudioService, useValue: {} },
    ],
  })
    .overrideGuard(AdminAuthGuard)
    .useValue(new StubAdminAuthGuard(new Reflector(), permissions))
    .compile()
  const app = module.createNestApplication()
  await app.init()
  return { app, fn: service[route.method] as jest.Mock }
}

describe.each(ROUTES)('POST $url (int)', (route) => {
  describe('with the permission', () => {
    let app: INestApplication
    let fn: jest.Mock

    beforeAll(async () => {
      ;({ app, fn } = await buildApp(route, [route.permission]))
    })
    afterAll(() => app.close())
    beforeEach(() => {
      fn.mockReset()
    })

    it('returns 200 with the per-id result even on partial failure', async () => {
      fn.mockResolvedValue(BATCH_RESULT as never)

      const res = await request(app.getHttpServer())
        .post(route.url)
        .send({ ids: [ID_A, ID_B] })

      expect(res.status).toBe(200)
      expect(res.body).toEqual(BATCH_RESULT)
      expect(fn).toHaveBeenCalledWith([ID_A, ID_B], ...route.extra, expect.any(Object))
    })

    it('returns 400 for more than 100 ids', async () => {
      const ids = Array.from(
        { length: 101 },
        (_, i) => `f47ac10b-58cc-4372-a567-${String(i).padStart(12, '0')}`,
      )

      const res = await request(app.getHttpServer()).post(route.url).send({ ids })

      expect(res.status).toBe(400)
      expect(fn).not.toHaveBeenCalled()
    })

    it('accepts exactly 100 ids', async () => {
      fn.mockResolvedValue(BATCH_RESULT as never)
      const ids = Array.from(
        { length: 100 },
        (_, i) => `f47ac10b-58cc-4372-a567-${String(i).padStart(12, '0')}`,
      )

      const res = await request(app.getHttpServer()).post(route.url).send({ ids })

      expect(res.status).toBe(200)
    })

    it.each([
      ['an empty list', { ids: [] }],
      ['a non-uuid id', { ids: ['nope'] }],
      ['a missing ids field', {}],
    ])('returns 400 for %s', async (_label, body) => {
      const res = await request(app.getHttpServer()).post(route.url).send(body)

      expect(res.status).toBe(400)
      expect(fn).not.toHaveBeenCalled()
    })
  })

  describe('without the permission', () => {
    let app: INestApplication
    let fn: jest.Mock

    beforeAll(async () => {
      ;({ app, fn } = await buildApp(route, []))
    })
    afterAll(() => app.close())

    it(`returns 403 — missing ${route.permission}`, async () => {
      const res = await request(app.getHttpServer())
        .post(route.url)
        .send({ ids: [ID_A] })

      expect(res.status).toBe(403)
      expect(fn).not.toHaveBeenCalled()
    })
  })
})

/**
 * AC2 at the HTTP level: the real `AuditInterceptor` and the real `AdminTracksService` over a
 * mocked Prisma. A batch of N takes writes N explicit rows, none for a failed id, and no
 * request-level aggregate row; a single-entity take-down still gets its interceptor row.
 */
describe('batch audit trail (int)', () => {
  let app: INestApplication
  let prisma: PrismaMock
  let transaction: DeepMockProxy<Prisma.TransactionClient>

  beforeAll(async () => {
    resetPrismaMock()
    prisma = prismaMock
    transaction = mockDeep<Prisma.TransactionClient>()
    prisma.$transaction.mockImplementation((callback: unknown) =>
      (callback as (client: Prisma.TransactionClient) => unknown)(transaction),
    )
    const module = await Test.createTestingModule({
      controllers: [AdminTracksController],
      providers: [
        AdminTracksService,
        { provide: PrismaService, useValue: prisma },
        { provide: 'TrackUploadService', useValue: {} },
        { provide: AdminTrackAudioService, useValue: {} },
        { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
      ],
    })
      .useMocker(() => ({}))
      .overrideGuard(AdminAuthGuard)
      .useValue(new StubAdminAuthGuard(new Reflector(), ['tracks:delete']))
      .compile()
    app = module.createNestApplication()
    await app.init()
  })
  afterAll(() => app.close())

  beforeEach(() => {
    prisma.auditLog.create.mockReset()
    transaction.auditLog.create.mockReset()
    prisma.track.findFirst.mockImplementation(((args: unknown) => {
      const id = (args as { where: { id: string } }).where.id
      if (id === ID_B) return Promise.resolve(buildTrack({ id, deletedAt: new Date() })) as never
      return Promise.resolve(buildTrack({ id, deletedAt: null })) as never
    }) as never)
    transaction.track.updateMany.mockResolvedValue({ count: 1 })
    transaction.track.findFirstOrThrow.mockImplementation(((args: unknown) => {
      const id = (args as { where: { id: string } }).where.id
      return Promise.resolve(buildTrackWithArtist({ id, deletedAt: new Date() })) as never
    }) as never)
  })

  it('writes one explicit row per affected track, none for a failed id, and no aggregate row', async () => {
    const ID_C = 'c1b2c3d4-58cc-4372-a567-0e02b2c3d479'

    const res = await request(app.getHttpServer())
      .post('/admin/tracks/batch/take-down')
      .send({ ids: [ID_A, ID_B, ID_C] })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ total: 3, succeeded: 2, failed: 1 })
    expect(transaction.auditLog.create).toHaveBeenCalledTimes(2)
    const entityIds = transaction.auditLog.create.mock.calls.map(
      ([args]) => (args as { data: { entityId: string } }).data.entityId,
    )
    expect(entityIds).toEqual([ID_A, ID_C])
    expect(prisma.auditLog.create).not.toHaveBeenCalled()
  })

  it('still records the interceptor row for a single-entity take-down', async () => {
    const res = await request(app.getHttpServer()).delete(`/admin/tracks/${ID_A}`)

    expect(res.status).toBe(200)
    expect(prisma.auditLog.create).toHaveBeenCalledTimes(1)
    expect(transaction.auditLog.create).toHaveBeenCalledTimes(1)
  })
})
