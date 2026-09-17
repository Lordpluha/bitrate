import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { SessionStore } from '@application/session'
import {
  DeactivateUserUseCase,
  GetUserUseCase,
  RestoreUserUseCase,
  RevokeUserSessionsUseCase,
} from '@application/users'
import { ResourceWriteError } from '@domain/shared'
import type { UserDetail } from '@domain/user'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UserDetailPage } from './user-detail'

const ADMIN_STAFF = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  email: 'ops@bitrate.me',
  username: 'ops',
  roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
  roleName: 'ADMIN',
  permissions: [],
}

function detail(overrides: Partial<UserDetail> = {}): UserDetail {
  return {
    id: '9f2504e0-4f89-41d3-9a0c-0305e82c3301',
    username: 'listener-1',
    email: 'listener@example.com',
    emailVerifiedAt: null,
    createdAt: new Date('2026-09-01T09:59:00.000Z'),
    deactivatedAt: null,
    counts: {
      playlists: 2,
      likedTracks: 5,
      listeningHistory: 10,
      reportsFiled: 0,
      activeSessions: 1,
    },
    ...overrides,
  }
}

const getUser = vi.fn<() => Promise<UserDetail>>()
const deactivate = vi.fn<() => Promise<void>>()
const restore = vi.fn<() => Promise<void>>()
const revokeSessions = vi.fn<() => Promise<number>>()

function create(): void {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideRouter([]),
      { provide: GetUserUseCase, useValue: { execute: getUser } },
      { provide: DeactivateUserUseCase, useValue: { execute: deactivate } },
      { provide: RestoreUserUseCase, useValue: { execute: restore } },
      { provide: RevokeUserSessionsUseCase, useValue: { execute: revokeSessions } },
    ],
  })
  /** ADMIN holds every permission by identity — see `hasPermission`. */
  TestBed.inject(SessionStore).set(ADMIN_STAFF)
}

describe('UserDetailPage', () => {
  beforeEach(() => {
    getUser.mockReset()
    deactivate.mockReset()
    restore.mockReset()
    revokeSessions.mockReset()
  })

  it('renders the counts grid once loaded', async () => {
    getUser.mockResolvedValue(detail())
    create()

    const fixture = TestBed.createComponent(UserDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    expect(host.textContent).toContain('listener-1')
    expect(host.textContent).toContain('Playlists')
    expect(host.querySelector('dd')?.textContent?.trim()).toBe('2')
  })

  it('shows the not-found message when the load rejects', async () => {
    getUser.mockRejectedValue(new Error('404'))
    create()

    const fixture = TestBed.createComponent(UserDetailPage)
    await fixture.whenStable()

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent,
    ).toContain('could not be found')
  })

  it('hides the restore button for an active account', async () => {
    getUser.mockResolvedValue(detail())
    create()

    const fixture = TestBed.createComponent(UserDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    const restoreButton = Array.from(host.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Restore',
    )
    expect(restoreButton).toBeUndefined()
  })

  it('arms and confirms a deactivate with the typed reason, then reloads', async () => {
    getUser.mockResolvedValue(detail())
    deactivate.mockResolvedValue(undefined)
    create()

    const fixture = TestBed.createComponent(UserDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    Array.from(host.querySelectorAll('button'))
      .find((b) => b.textContent?.trim() === 'Deactivate')
      ?.click()
    await fixture.whenStable()

    const textarea = host.querySelector<HTMLTextAreaElement>('textarea')
    expect(textarea).not.toBeNull()
    if (textarea) {
      textarea.value = 'rights claim'
      textarea.dispatchEvent(new Event('input'))
    }
    await fixture.whenStable()

    Array.from(host.querySelectorAll('button'))
      .find((b) => b.textContent?.includes('Yes, deactivate'))
      ?.click()
    await fixture.whenStable()

    expect(deactivate).toHaveBeenCalledWith(expect.objectContaining({ reason: 'rights claim' }))
    expect(getUser).toHaveBeenCalledTimes(2)
  })

  it('reloads and reports a stale-state message on a 409', async () => {
    getUser.mockResolvedValue(detail())
    deactivate.mockRejectedValue(new ResourceWriteError('already-deactivated'))
    create()

    const fixture = TestBed.createComponent(UserDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    Array.from(host.querySelectorAll('button'))
      .find((b) => b.textContent?.trim() === 'Deactivate')
      ?.click()
    await fixture.whenStable()
    Array.from(host.querySelectorAll('button'))
      .find((b) => b.textContent?.includes('Yes, deactivate'))
      ?.click()
    await fixture.whenStable()

    expect(host.querySelector('[role="alert"]')?.textContent).toContain('already deactivated')
    expect(getUser).toHaveBeenCalledTimes(2)
  })
})
