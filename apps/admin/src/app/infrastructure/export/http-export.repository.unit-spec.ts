import { HttpHeaders, provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { ExportRepository } from '@domain/export'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ADMIN_API } from '../http/api.config'
import { HttpExportRepository } from './http-export.repository'

const csv = () => new Blob(['id\r\n'], { type: 'text/csv' })
const headers = (truncated: 'true' | 'false', filename = 'users-20260301T102030Z.csv') =>
  new HttpHeaders({
    'Content-Disposition': `attachment; filename="${filename}"`,
    'X-Export-Truncated': truncated,
  })

describe('HttpExportRepository', () => {
  let repository: ExportRepository
  let http: HttpTestingController

  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ExportRepository, useClass: HttpExportRepository },
      ],
    })
    repository = TestBed.inject(ExportRepository)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  it('asks for the users CSV with the list filters and sort, and no pagination', async () => {
    const result = repository.exportUsers({
      query: 'ann',
      status: 'all',
      sort: { field: 'email', direction: 'desc' },
    })

    const request = http.expectOne((candidate) => candidate.url === `${ADMIN_API}/users/export.csv`)
    expect(request.request.method).toBe('GET')
    expect(request.request.responseType).toBe('blob')
    expect(request.request.withCredentials).toBe(false) // added by the auth interceptor, not here
    expect(request.request.params.keys().sort()).toEqual(['order', 'q', 'sort', 'status'])
    expect(request.request.params.get('q')).toBe('ann')
    expect(request.request.params.get('status')).toBe('all')
    expect(request.request.params.get('sort')).toBe('email')
    expect(request.request.params.get('order')).toBe('desc')
    request.flush(csv(), { headers: headers('false') })

    const download = await result
    expect(download.filename).toBe('users-20260301T102030Z.csv')
    expect(download.truncated).toBe(false)
    expect(download.blob).toBeInstanceOf(Blob)
  })

  it('reports a truncated export', async () => {
    const result = repository.exportUsers({})

    http.expectOne(`${ADMIN_API}/users/export.csv`).flush(csv(), { headers: headers('true') })

    expect((await result).truncated).toBe(true)
  })

  it('falls back to a resource filename when Content-Disposition is not readable', async () => {
    const result = repository.exportArtists({})

    http.expectOne(`${ADMIN_API}/artists/export.csv`).flush(csv())

    expect(await result).toMatchObject({ filename: 'artists.csv', truncated: false })
  })

  it('maps the artists filters, including verified=false', async () => {
    const result = repository.exportArtists({
      verified: false,
      status: 'deactivated',
      sort: { field: 'monthlyListeners', direction: 'asc' },
    })

    const request = http.expectOne(
      (candidate) => candidate.url === `${ADMIN_API}/artists/export.csv`,
    )
    expect(request.request.params.get('verified')).toBe('false')
    expect(request.request.params.get('status')).toBe('deactivated')
    expect(request.request.params.get('sort')).toBe('monthlyListeners')
    expect(request.request.params.get('order')).toBe('asc')
    request.flush(csv())
    await result
  })

  it('maps the catalog filters', async () => {
    const result = repository.exportTracks({
      query: 'x',
      processingStatus: 'FAILED',
      status: 'active',
      sort: { field: 'title', direction: 'asc' },
    })

    const request = http.expectOne(
      (candidate) => candidate.url === `${ADMIN_API}/tracks/export.csv`,
    )
    expect(request.request.params.get('processingStatus')).toBe('FAILED')
    expect(request.request.params.get('status')).toBe('active')
    expect(request.request.params.get('q')).toBe('x')
    expect(request.request.params.get('sort')).toBe('title')
    request.flush(csv())
    await result
  })

  it('maps the moderation filters onto the reports route', async () => {
    const result = repository.exportReports({
      status: 'OPEN',
      entityType: 'track',
      sort: { field: 'createdAt', direction: 'desc' },
    })

    const request = http.expectOne(
      (candidate) => candidate.url === `${ADMIN_API}/moderation/reports/export.csv`,
    )
    expect(request.request.params.get('status')).toBe('OPEN')
    expect(request.request.params.get('entityType')).toBe('track')
    expect(request.request.params.get('sort')).toBe('createdAt')
    request.flush(csv())
    await result
  })

  it('sends no parameters for an empty filter', async () => {
    const result = repository.exportReports({})

    const request = http.expectOne(`${ADMIN_API}/moderation/reports/export.csv`)
    expect(request.request.params.keys()).toEqual([])
    request.flush(csv())
    await result
  })
})
