import { Readable } from 'node:stream'
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AdminAuthGuard, type Permission } from '@modules/admin-auth'
import type { INestApplication, Type } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test } from '@nestjs/testing'
import { StubAdminAuthGuard } from '@test/mocks/stub-admin-auth.guard'
import request from 'supertest'
import { AdminArtistsController } from './artists/admin-artists.controller'
import { AdminArtistsService } from './artists/admin-artists.service'
import { AdminModerationController } from './moderation/admin-moderation.controller'
import { AdminModerationService } from './moderation/admin-moderation.service'
import { AdminTrackAudioService } from './tracks/admin-track-audio.service'
import { AdminTracksController } from './tracks/admin-tracks.controller'
import { AdminTracksService } from './tracks/admin-tracks.service'
import { AdminUsersController } from './users/admin-users.controller'
import { AdminUsersService } from './users/admin-users.service'

/** `TrackUploadService` pulls in `music-metadata`, which cannot be resolved under Jest. */
jest.mock('music-metadata', () => ({ parseFile: jest.fn() }), { virtual: true })

type ExportMock = jest.Mock<(...args: unknown[]) => Promise<unknown>>

type ExportCase = {
  name: string
  path: string
  permission: Permission
  controller: Type
  service: Type
  /** A filter + sort the resource's list accepts, and the service input it must become. */
  query: Record<string, string>
  expected: Record<string, unknown>
  filePrefix: string
}

const CASES: ExportCase[] = [
  {
    name: 'users',
    path: '/admin/users/export.csv',
    permission: 'users:export',
    controller: AdminUsersController,
    service: AdminUsersService,
    query: { status: 'all', q: 'ann', sort: 'email', order: 'desc', page: '3', limit: '10' },
    expected: { status: 'all', q: 'ann', sort: 'email', order: 'desc' },
    filePrefix: 'users-',
  },
  {
    name: 'artists',
    path: '/admin/artists/export.csv',
    permission: 'artists:export',
    controller: AdminArtistsController,
    service: AdminArtistsService,
    query: { verified: 'false', status: 'deactivated', sort: 'monthlyListeners', order: 'asc' },
    expected: { verified: false, status: 'deactivated', sort: 'monthlyListeners', order: 'asc' },
    filePrefix: 'artists-',
  },
  {
    name: 'tracks',
    path: '/admin/tracks/export.csv',
    permission: 'tracks:export',
    controller: AdminTracksController,
    service: AdminTracksService,
    query: { processingStatus: 'FAILED', q: 'x', sort: 'title', order: 'asc' },
    expected: { processingStatus: 'FAILED', q: 'x', sort: 'title', order: 'asc' },
    filePrefix: 'tracks-',
  },
  {
    name: 'reports',
    path: '/admin/moderation/reports/export.csv',
    permission: 'reports:export',
    controller: AdminModerationController,
    service: AdminModerationService,
    query: { status: 'OPEN', entityType: 'track', sort: 'status', order: 'desc' },
    expected: { status: 'OPEN', entityType: 'track', sort: 'status', order: 'desc' },
    filePrefix: 'reports-',
  },
]

const buildApp = async (testCase: ExportCase, permissions: Permission[]) => {
  const exportCsv: ExportMock = jest.fn()
  const reflector = new Reflector()
  const module = await Test.createTestingModule({
    controllers: [testCase.controller],
    providers: [
      { provide: testCase.service, useValue: { exportCsv } },
      { provide: AdminTrackAudioService, useValue: {} },
    ],
  })
    .overrideGuard(AdminAuthGuard)
    .useValue(new StubAdminAuthGuard(reflector, permissions))
    .compile()
  const app = module.createNestApplication()
  await app.init()
  return { app, exportCsv }
}

describe.each(CASES)('GET $path (int)', (testCase) => {
  describe(`with ${testCase.permission}`, () => {
    let app: INestApplication
    let exportCsv: ExportMock

    beforeAll(async () => {
      ;({ app, exportCsv } = await buildApp(testCase, [testCase.permission]))
    })
    afterAll(() => app.close())
    beforeEach(() => {
      exportCsv.mockReset()
    })

    it('streams a text/csv attachment with the truncation header', async () => {
      exportCsv.mockResolvedValue({
        stream: Readable.from(['id\r\n', '1\r\n']),
        truncated: true,
        rowCount: 1,
      })

      const res = await request(app.getHttpServer()).get(testCase.path)

      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toBe('text/csv; charset=utf-8')
      expect(res.headers['content-disposition']).toMatch(
        new RegExp(`^attachment; filename="${testCase.filePrefix}\\d{8}T\\d{6}Z\\.csv"$`),
      )
      expect(res.headers['x-export-truncated']).toBe('true')
      expect(res.text).toBe('id\r\n1\r\n')
    })

    it('reports a complete export as X-Export-Truncated: false', async () => {
      exportCsv.mockResolvedValue({
        stream: Readable.from(['id\r\n']),
        truncated: false,
        rowCount: 0,
      })

      const res = await request(app.getHttpServer()).get(testCase.path)

      expect(res.headers['x-export-truncated']).toBe('false')
    })

    it('forwards the list filters and sort, drops pagination, and passes the staff id', async () => {
      exportCsv.mockResolvedValue({
        stream: Readable.from(['id\r\n']),
        truncated: false,
        rowCount: 0,
      })

      await request(app.getHttpServer()).get(testCase.path).query(testCase.query)

      expect(exportCsv).toHaveBeenCalledWith(testCase.expected, 'staff-1', expect.any(Object))
    })

    it('rejects a sort field outside the allowlist with 400', async () => {
      const res = await request(app.getHttpServer()).get(testCase.path).query({ sort: 'password' })

      expect(res.status).toBe(400)
      expect(exportCsv).not.toHaveBeenCalled()
    })
  })

  describe('without the export permission', () => {
    let app: INestApplication
    let exportCsv: ExportMock

    beforeAll(async () => {
      ;({ app, exportCsv } = await buildApp(testCase, [
        'users:read',
        'tracks:read',
        'reports:read',
        'artists:read',
      ]))
    })
    afterAll(() => app.close())

    it('returns 403 and never exports', async () => {
      const res = await request(app.getHttpServer()).get(testCase.path)

      expect(res.status).toBe(403)
      expect(exportCsv).not.toHaveBeenCalled()
    })
  })
})
