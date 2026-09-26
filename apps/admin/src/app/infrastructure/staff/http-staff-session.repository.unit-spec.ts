import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { StaffSessionRepository } from '@domain/staff'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ADMIN_API } from '../http/api.config'
import { HttpStaffSessionRepository } from './http-staff-session.repository'

const LOGIN = `${ADMIN_API}/auth/login`
const ME = `${ADMIN_API}/auth/me`

const staffResponse = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  email: 'ops@bitrate.me',
  username: 'ops',
  roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
  role: 'ADMIN',
  permissions: [],
}

const credentials = { email: 'ops@bitrate.me', password: 'correct-horse-battery' }

/** `/me` is only issued once the login promise settles, so the queue needs a turn first. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('HttpStaffSessionRepository', () => {
  let repository: StaffSessionRepository
  let http: HttpTestingController

  beforeEach(() => {
    /** The builder shares one TestBed across spec files; configuring a live one throws. */
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: StaffSessionRepository, useClass: HttpStaffSessionRepository },
      ],
    })

    repository = TestBed.inject(StaffSessionRepository)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  describe('signIn', () => {
    /**
     * The regression this file exists for: `POST /admin/auth/login` answers 201 with no body,
     * and parsing that empty body threw, so correct credentials reported "Sign-in failed" while
     * the cookies had in fact been set.
     */
    it('resolves from /me when login answers with an empty body', async () => {
      const signedIn = repository.signIn(credentials)

      http.expectOne(LOGIN).flush(null, { status: 201, statusText: 'Created' })
      await settle()
      http.expectOne(ME).flush(staffResponse)

      await expect(signedIn).resolves.toMatchObject({ username: 'ops', roleName: 'ADMIN' })
    })

    it('rejects when the credentials are refused', async () => {
      const signedIn = repository.signIn(credentials)

      http
        .expectOne(LOGIN)
        .flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' })

      await expect(signedIn).rejects.toBeDefined()
    })

    it('rejects when the session cannot be read back after a successful login', async () => {
      const signedIn = repository.signIn(credentials)

      http.expectOne(LOGIN).flush(null, { status: 201, statusText: 'Created' })
      await settle()
      http.expectOne(ME).flush(null, { status: 401, statusText: 'Unauthorized' })

      await expect(signedIn).rejects.toThrow(/could not be read back/)
    })
  })

  describe('currentStaff', () => {
    it('answers null instead of throwing when there is no valid session', async () => {
      const current = repository.currentStaff()

      http.expectOne(ME).flush(null, { status: 401, statusText: 'Unauthorized' })

      await expect(current).resolves.toBeNull()
    })

    it('answers null when the payload does not match the contract', async () => {
      const current = repository.currentStaff()

      http.expectOne(ME).flush({ id: 'not-a-uuid', email: 'ops', username: 'ops', role: 'GHOST' })

      await expect(current).resolves.toBeNull()
    })
  })
})
