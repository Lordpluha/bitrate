import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { ModerationReportRepository } from '@domain/moderation'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ADMIN_API } from '../http/api.config'
import { HttpModerationReportRepository } from './http-moderation-report.repository'

const BASE = `${ADMIN_API}/moderation/reports`

const PAGE_RESPONSE = { data: [], total: 0, page: 1, limit: 20 }

const DETAIL_ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'

const DETAIL_RESPONSE = {
  id: DETAIL_ID,
  reporterId: '3f2504e0-4f89-41d3-9a0c-0305e82c3302',
  entityType: 'track',
  entityId: '3f2504e0-4f89-41d3-9a0c-0305e82c3303',
  reason: 'Copyright',
  details: null,
  status: 'OPEN',
  resolvedAt: null,
  createdAt: '2026-09-14T12:00:00.000Z',
  subject: null,
  siblingReports: [],
}

describe('HttpModerationReportRepository', () => {
  let repository: ModerationReportRepository
  let http: HttpTestingController

  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ModerationReportRepository, useClass: HttpModerationReportRepository },
      ],
    })

    repository = TestBed.inject(ModerationReportRepository)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  it('sends the entityType filter when it is set', () => {
    void repository.list({ page: 1, filter: { entityType: 'track' } })

    const request = http.expectOne(
      (req) => req.url === BASE && req.params.get('entityType') === 'track',
    )
    request.flush(PAGE_RESPONSE)
  })

  it('omits the entityType filter when it is unset', () => {
    void repository.list({ page: 1, filter: {} })

    const request = http.expectOne((req) => req.url === BASE)
    expect(request.request.params.has('entityType')).toBe(false)
    request.flush(PAGE_RESPONSE)
  })

  it('fetches and maps a report with a null subject', async () => {
    const result = repository.getById(DETAIL_ID)

    http.expectOne(`${BASE}/${DETAIL_ID}`).flush(DETAIL_RESPONSE)

    await expect(result).resolves.toMatchObject({
      id: DETAIL_ID,
      subject: null,
      siblingReports: [],
    })
  })
})
