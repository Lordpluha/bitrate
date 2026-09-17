import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import {
  DeactivateArtistUseCase,
  GetArtistUseCase,
  RestoreArtistUseCase,
  RevokeArtistSessionsUseCase,
  ToggleArtistVerificationUseCase,
} from '@application/artists'
import { SessionStore } from '@application/session'
import type { ArtistDetail } from '@domain/artist'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ArtistDetailPage } from './artist-detail'

const ADMIN_STAFF = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  email: 'ops@bitrate.me',
  username: 'ops',
  roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
  roleName: 'ADMIN',
  permissions: [],
}

function detail(overrides: Partial<ArtistDetail> = {}): ArtistDetail {
  return {
    id: '9f2504e0-4f89-41d3-9a0c-0305e82c3301',
    username: 'dj-test',
    email: 'dj@example.com',
    verified: false,
    monthlyListeners: 100,
    country: null,
    createdAt: new Date('2026-09-01T09:59:00.000Z'),
    deactivatedAt: null,
    counts: { tracks: 3, albums: 1, activeSessions: 1, openReports: 0 },
    ...overrides,
  }
}

const getArtist = vi.fn<() => Promise<ArtistDetail>>()

function create(): void {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideRouter([]),
      { provide: GetArtistUseCase, useValue: { execute: getArtist } },
      { provide: DeactivateArtistUseCase, useValue: { execute: vi.fn() } },
      { provide: RestoreArtistUseCase, useValue: { execute: vi.fn() } },
      { provide: RevokeArtistSessionsUseCase, useValue: { execute: vi.fn() } },
      { provide: ToggleArtistVerificationUseCase, useValue: { execute: vi.fn() } },
    ],
  })
  /** ADMIN holds every permission by identity — see `hasPermission`. */
  TestBed.inject(SessionStore).set(ADMIN_STAFF)
}

describe('ArtistDetailPage', () => {
  beforeEach(() => {
    getArtist.mockReset()
  })

  it('renders the counts grid once loaded', async () => {
    getArtist.mockResolvedValue(detail())
    create()

    const fixture = TestBed.createComponent(ArtistDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    expect(host.textContent).toContain('dj-test')
    expect(host.textContent).toContain('Tracks')
  })

  it('hides the verify button for a deactivated artist', async () => {
    getArtist.mockResolvedValue(detail({ deactivatedAt: new Date('2026-09-10T08:00:00.000Z') }))
    create()

    const fixture = TestBed.createComponent(ArtistDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    const verifyButton = Array.from(host.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Verify' || b.textContent?.trim() === 'Unverify',
    )
    expect(verifyButton).toBeUndefined()
  })

  it('shows the verify button for an active artist an operator can verify', async () => {
    getArtist.mockResolvedValue(detail({ verified: false }))
    create()

    const fixture = TestBed.createComponent(ArtistDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    const verifyButton = Array.from(host.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Verify',
    )
    expect(verifyButton).not.toBeUndefined()
  })

  it('shows the not-found message when the load rejects', async () => {
    getArtist.mockRejectedValue(new Error('404'))
    create()

    const fixture = TestBed.createComponent(ArtistDetailPage)
    await fixture.whenStable()

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent,
    ).toContain('could not be found')
  })
})
