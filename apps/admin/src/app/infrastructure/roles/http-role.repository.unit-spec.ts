import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { RoleRepository, RoleWriteError } from '@domain/role'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ADMIN_API } from '../http/api.config'
import { HttpRoleRepository } from './http-role.repository'

const BASE = `${ADMIN_API}/roles`

const ROLE_RESPONSE = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  name: 'Catalog reviewer',
  description: null,
  builtIn: false,
  permissions: ['tracks:read'],
  holders: 0,
  divergentHolders: 0,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
}

describe('HttpRoleRepository', () => {
  let repository: RoleRepository
  let http: HttpTestingController

  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RoleRepository, useClass: HttpRoleRepository },
      ],
    })

    repository = TestBed.inject(RoleRepository)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  it('creates a role and maps the response', async () => {
    const created = repository.create({ name: 'Catalog reviewer', permissions: ['tracks:read'] })

    http.expectOne(BASE).flush(ROLE_RESPONSE)

    await expect(created).resolves.toMatchObject({ name: 'Catalog reviewer' })
  })

  it('maps a duplicate-name conflict on create to RoleWriteError', async () => {
    const created = repository.create({ name: 'Catalog reviewer', permissions: [] })

    http.expectOne(BASE).flush(null, { status: 409, statusText: 'Conflict' })

    const error = await created.catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(RoleWriteError)
    expect((error as RoleWriteError).reason).toBe('duplicate-name')
  })

  it('maps a 400 on update to RoleWriteError with reason not-allowed', async () => {
    const updated = repository.update({ id: ROLE_RESPONSE.id, permissions: ['staff:write'] })

    http
      .expectOne(`${BASE}/${ROLE_RESPONSE.id}`)
      .flush(null, { status: 400, statusText: 'Bad Request' })

    const error = await updated.catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(RoleWriteError)
    expect((error as RoleWriteError).reason).toBe('not-allowed')
  })

  it('maps a 404 on update to RoleWriteError with reason not-found', async () => {
    const updated = repository.update({ id: ROLE_RESPONSE.id, name: 'New name' })

    http
      .expectOne(`${BASE}/${ROLE_RESPONSE.id}`)
      .flush(null, { status: 404, statusText: 'Not Found' })

    const error = await updated.catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(RoleWriteError)
    expect((error as RoleWriteError).reason).toBe('not-found')
  })

  it('maps a 409 on delete to RoleWriteError with reason in-use, distinct from create', async () => {
    const removed = repository.delete(ROLE_RESPONSE.id)

    http
      .expectOne(`${BASE}/${ROLE_RESPONSE.id}`)
      .flush(null, { status: 409, statusText: 'Conflict' })

    const error = await removed.catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(RoleWriteError)
    expect((error as RoleWriteError).reason).toBe('in-use')
  })

  it('lists the permission catalogue, keeping an unheld protected permission', async () => {
    const catalogue = repository.listPermissionCatalogue()

    http.expectOne(`${BASE}/permissions`).flush([{ id: 'staff:write', heldBy: 0, protected: true }])

    await expect(catalogue).resolves.toEqual([
      { permission: 'staff:write', heldBy: 0, protected: true },
    ])
  })
})
