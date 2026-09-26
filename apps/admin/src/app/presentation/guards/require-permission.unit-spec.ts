import { Component, provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import {
  type ActivatedRouteSnapshot,
  provideRouter,
  Router,
  type RouterStateSnapshot,
  type UrlTree,
} from '@angular/router'
import { SessionStore } from '@application/session'
import type { Permission } from '@domain/access'
import { type Staff, StaffSessionRepository } from '@domain/staff'
import { beforeEach, describe, expect, it } from 'vitest'
import { requirePermission } from './require-permission'
import { requireStaffSession } from './require-staff-session'

const STAFF: Staff = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  email: 'ops@bitrate.me',
  username: 'ops',
  roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
  roleName: 'MODERATOR',
  permissions: [],
}

describe('requirePermission', () => {
  let router: Router

  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        /** Never called here: every case below seeds the store, so no restore is needed. */
        { provide: StaffSessionRepository, useValue: {} },
      ],
    })
    router = TestBed.inject(Router)
  })

  function activate(permission: Permission) {
    return TestBed.runInInjectionContext(() =>
      requirePermission(permission)({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    )
  }

  it('allows navigation when the operator holds the permission', async () => {
    TestBed.inject(SessionStore).set({ ...STAFF, permissions: ['reports:read'] })

    expect(await activate('reports:read')).toBe(true)
  })

  it('redirects to the first route the operator can reach when the permission is missing', async () => {
    TestBed.inject(SessionStore).set({ ...STAFF, permissions: ['users:read'] })

    const result = (await activate('reports:read')) as UrlTree

    expect(router.serializeUrl(result)).toBe('/users')
  })

  it('does not redirect to a route the operator also cannot reach — the loop case', async () => {
    /** Holds nothing guarding any of the five screens — only a permission none of them checks. */
    TestBed.inject(SessionStore).set({ ...STAFF, permissions: ['staff:write'] })

    const result = (await activate('reports:read')) as UrlTree

    expect(router.serializeUrl(result)).toBe('/no-access')
  })
})

/**
 * Every case above seeds the store first, which is exactly the condition that hides this one.
 * On a cold page load the store is empty until `requireStaffSession` finishes asking `/me` — and
 * Angular invokes every guard in a `canActivate` array at once, only *prioritising* their results
 * in array order. A permission guard that reads the store synchronously therefore sees nobody.
 */
describe('requirePermission on a cold page load', () => {
  @Component({ selector: 'app-blank', template: '' })
  class BlankComponent {}

  class SlowStaffSessionRepository extends StaffSessionRepository {
    override async signIn(): Promise<Staff> {
      throw new Error('not used')
    }

    static calls = 0

    /** Resolves on a later turn, like the real `/me` request. */
    override currentStaff(): Promise<Staff | null> {
      SlowStaffSessionRepository.calls++
      return new Promise((resolve) =>
        setTimeout(() => resolve({ ...STAFF, permissions: ['reports:read'] }), 0),
      )
    }

    override async signOut(): Promise<void> {
      throw new Error('not used')
    }
  }

  beforeEach(() => {
    SlowStaffSessionRepository.calls = 0
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([
          {
            path: '',
            pathMatch: 'full',
            component: BlankComponent,
            canActivate: [requireStaffSession, requirePermission('overview:read')],
          },
          {
            path: 'moderation',
            component: BlankComponent,
            canActivate: [requireStaffSession, requirePermission('reports:read')],
          },
          { path: 'no-access', component: BlankComponent, canActivate: [requireStaffSession] },
          { path: 'login', component: BlankComponent },
        ]),
        { provide: StaffSessionRepository, useClass: SlowStaffSessionRepository },
      ],
    })
  })

  it('lets an operator who holds the permission through once the session restores', async () => {
    const router = TestBed.inject(Router)

    await router.navigateByUrl('/moderation')

    expect(router.url).toBe('/moderation')
  })

  it('shares one /me request between the two guards instead of sending two', async () => {
    const router = TestBed.inject(Router)

    await router.navigateByUrl('/moderation')

    expect(SlowStaffSessionRepository.calls).toBe(1)
  })
})

/**
 * A MODERATOR holding `reports:read` but not the new `overview:read` cannot land on the root
 * dashboard route — the same cold-load, empty-store composition as above, restored with a
 * narrower permission set.
 */
describe('requirePermission — a MODERATOR without overview:read on a cold page load', () => {
  @Component({ selector: 'app-blank', template: '' })
  class BlankComponent {}

  class ModeratorWithoutOverviewRepository extends StaffSessionRepository {
    override async signIn(): Promise<Staff> {
      throw new Error('not used')
    }

    /** Resolves on a later turn, like the real `/me` request. */
    override currentStaff(): Promise<Staff | null> {
      return new Promise((resolve) =>
        setTimeout(() => resolve({ ...STAFF, permissions: ['reports:read'] }), 0),
      )
    }

    override async signOut(): Promise<void> {
      throw new Error('not used')
    }
  }

  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([
          {
            path: '',
            pathMatch: 'full',
            component: BlankComponent,
            canActivate: [requireStaffSession, requirePermission('overview:read')],
          },
          {
            path: 'moderation',
            component: BlankComponent,
            canActivate: [requireStaffSession, requirePermission('reports:read')],
          },
          { path: 'no-access', component: BlankComponent, canActivate: [requireStaffSession] },
          { path: 'login', component: BlankComponent },
        ]),
        { provide: StaffSessionRepository, useClass: ModeratorWithoutOverviewRepository },
      ],
    })
  })

  it('lands on moderation instead of looping back to the denied root route', async () => {
    const router = TestBed.inject(Router)

    await router.navigateByUrl('/')

    expect(router.url).toBe('/moderation')
  })
})
