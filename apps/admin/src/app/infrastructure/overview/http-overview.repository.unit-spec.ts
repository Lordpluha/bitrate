import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { OverviewRepository } from '@domain/overview'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ADMIN_API } from '../http/api.config'
import { HttpOverviewRepository } from './http-overview.repository'

const BASE = `${ADMIN_API}/overview`

const OVERVIEW_RESPONSE = {
  reports: { open: 3, reviewing: 2 },
  tracks: { processing: 4, ready: 50, failed: 1, stuck: 2, stuckAfterMs: 1_800_000 },
  deactivated: { users: 7, artists: 1 },
  last7Days: { signups: 8, uploads: 5 },
  recentActivity: [],
}

describe('HttpOverviewRepository', () => {
  let repository: OverviewRepository
  let http: HttpTestingController

  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: OverviewRepository, useClass: HttpOverviewRepository },
      ],
    })

    repository = TestBed.inject(OverviewRepository)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  it('fetches and maps the aggregate summary', async () => {
    const summary = repository.get()

    http.expectOne(BASE).flush(OVERVIEW_RESPONSE)

    await expect(summary).resolves.toEqual({
      reports: { open: 3, reviewing: 2 },
      tracks: { processing: 4, ready: 50, failed: 1, stuck: 2, stuckAfterMs: 1_800_000 },
      deactivated: { users: 7, artists: 1 },
      last7Days: { signups: 8, uploads: 5 },
      recentActivity: [],
    })
  })

  it('rejects when the response fails schema validation', async () => {
    const summary = repository.get()

    http.expectOne(BASE).flush({ reports: { open: 3, reviewing: 2 } })

    await expect(summary).rejects.toThrow()
  })

  it('fetches the series with the requested window as a query parameter', () => {
    void repository.getSeries(7)

    const request = http.expectOne((req) => req.url === `${BASE}/series`)

    expect(request.request.params.get('days')).toBe('7')
    request.flush({
      from: '2026-09-10',
      to: '2026-09-17',
      days: 7,
      uploads: [],
      signups: [],
      listens: [],
      reports: [],
      reportsByStatus: { open: 0, reviewing: 0, resolved: 0, rejected: 0 },
    })
  })

  it('rejects the series request when the response fails schema validation', async () => {
    const series = repository.getSeries(30)

    http.expectOne((req) => req.url === `${BASE}/series`).flush({ days: 30 })

    await expect(series).rejects.toThrow()
  })
})
