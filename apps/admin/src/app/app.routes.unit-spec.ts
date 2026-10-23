import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Title } from '@angular/platform-browser'
import { provideRouter, Router, TitleStrategy } from '@angular/router'
import { RestoreSessionUseCase, SessionStore } from '@application/session'
import type { Staff } from '@domain/staff'
import { OperatorTitleStrategy } from '@presentation/navigation'
import { beforeEach, describe, expect, it } from 'vitest'
import { routes } from './app.routes'

const ADMIN: Staff = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  email: 'ops@bitrate.me',
  username: 'ops',
  roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
  roleName: 'ADMIN',
  permissions: [],
}

/** No router outlet: only guards, redirects and titles run — no page is rendered. */
function setUp(): Router {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideRouter(routes),
      { provide: TitleStrategy, useClass: OperatorTitleStrategy },
      { provide: RestoreSessionUseCase, useValue: { execute: async () => null } },
    ],
  })
  return TestBed.inject(Router)
}

describe('routes', () => {
  let router: Router

  beforeEach(() => {
    router = setUp()
  })

  it('sends a visitor without a staff session to sign in, remembering where they were going', async () => {
    await router.navigateByUrl('/albums/42')

    expect(router.url).toBe('/login?next=%2Falbums%2F42')
    expect(TestBed.inject(Title).getTitle()).toBe('Sign in · Bitrate operators')
  })

  it('lets a signed-in operator through with the suffixed page title', async () => {
    TestBed.inject(SessionStore).set(ADMIN)

    await router.navigateByUrl('/albums/42')

    expect(router.url).toBe('/albums/42')
    expect(TestBed.inject(Title).getTitle()).toBe('Album · Bitrate operators')
  })

  it('keeps literal paths ahead of their :id siblings', async () => {
    TestBed.inject(SessionStore).set(ADMIN)

    await router.navigateByUrl('/genres/new')

    expect(TestBed.inject(Title).getTitle()).toBe('New genre · Bitrate operators')
  })

  it('keeps an unknown path and titles it as not found, instead of hiding it behind /', async () => {
    TestBed.inject(SessionStore).set(ADMIN)

    await router.navigateByUrl('/nowhere')

    expect(router.url).toBe('/nowhere')
    expect(TestBed.inject(Title).getTitle()).toBe('Not found · Bitrate operators')
  })

  it('sends a visitor without a staff session from an unknown path to sign in', async () => {
    await router.navigateByUrl('/nowhere')

    expect(router.url).toBe('/login?next=%2Fnowhere')
  })
})
