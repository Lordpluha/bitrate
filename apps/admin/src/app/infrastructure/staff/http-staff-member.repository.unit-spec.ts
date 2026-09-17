import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { StaffRepository, StaffWriteError } from '@domain/staff'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ADMIN_API } from '../http/api.config'
import { HttpStaffRepository } from './http-staff-member.repository'

const BASE = `${ADMIN_API}/staff`

const STAFF_RESPONSE = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  email: 'ops@bitrate.me',
  username: 'ops',
  role: {
    id: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
    name: 'MODERATOR',
    permissions: ['reports:read'],
  },
  permissions: ['reports:read'],
  deletedAt: null,
  createdAt: '2026-09-01T00:00:00.000Z',
}

describe('HttpStaffRepository', () => {
  let repository: StaffRepository
  let http: HttpTestingController

  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: StaffRepository, useClass: HttpStaffRepository },
      ],
    })

    repository = TestBed.inject(StaffRepository)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  it('creates an operator and maps the response', async () => {
    const created = repository.create({
      email: 'ops@bitrate.me',
      username: 'ops',
      password: 'correct-horse-battery',
      roleId: STAFF_RESPONSE.role.id,
    })

    http.expectOne(BASE).flush(STAFF_RESPONSE)

    await expect(created).resolves.toMatchObject({ username: 'ops' })
  })

  it('maps a conflict on create to StaffWriteError with reason conflict', async () => {
    const created = repository.create({
      email: 'ops@bitrate.me',
      username: 'ops',
      password: 'correct-horse-battery',
      roleId: STAFF_RESPONSE.role.id,
    })

    http.expectOne(BASE).flush(null, { status: 409, statusText: 'Conflict' })

    const error = await created.catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(StaffWriteError)
    expect((error as StaffWriteError).reason).toBe('conflict')
  })

  it('maps a 404 on assignRole to StaffWriteError with reason not-found', async () => {
    const assigned = repository.assignRole({
      id: STAFF_RESPONSE.id,
      roleId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    })

    http
      .expectOne(`${BASE}/${STAFF_RESPONSE.id}/role`)
      .flush(null, { status: 404, statusText: 'Not Found' })

    const error = await assigned.catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(StaffWriteError)
    expect((error as StaffWriteError).reason).toBe('not-found')
  })

  it('maps a 409 on assignRole to StaffWriteError with reason last-admin', async () => {
    const assigned = repository.assignRole({
      id: STAFF_RESPONSE.id,
      roleId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    })

    http
      .expectOne(`${BASE}/${STAFF_RESPONSE.id}/role`)
      .flush(null, { status: 409, statusText: 'Conflict' })

    const error = await assigned.catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(StaffWriteError)
    expect((error as StaffWriteError).reason).toBe('last-admin')
  })

  it('maps a 400 on updatePermissions to StaffWriteError with reason not-allowed', async () => {
    const updated = repository.updatePermissions({
      id: STAFF_RESPONSE.id,
      permissions: ['staff:write'],
    })

    http
      .expectOne(`${BASE}/${STAFF_RESPONSE.id}/permissions`)
      .flush(null, { status: 400, statusText: 'Bad Request' })

    const error = await updated.catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(StaffWriteError)
    expect((error as StaffWriteError).reason).toBe('not-allowed')
  })

  it('maps a 409 on deactivate to StaffWriteError with reason last-admin', async () => {
    const removed = repository.deactivate(STAFF_RESPONSE.id)

    http
      .expectOne(`${BASE}/${STAFF_RESPONSE.id}`)
      .flush(null, { status: 409, statusText: 'Conflict' })

    const error = await removed.catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(StaffWriteError)
    expect((error as StaffWriteError).reason).toBe('last-admin')
  })
})
