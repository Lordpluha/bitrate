import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { GetAlbumUseCase, RestoreAlbumUseCase, TakeDownAlbumUseCase } from '@application/albums'
import { SessionStore } from '@application/session'
import type { AlbumDetail } from '@domain/album'
import { ResourceWriteError } from '@domain/shared'
import { TranslocoTestingModule } from '@jsverse/transloco'
import { DEFAULT_LOCALE, LOCALES } from '@presentation/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AlbumDetailPage } from './album-detail'

const ADMIN_STAFF = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  email: 'ops@bitrate.me',
  username: 'ops',
  roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
  roleName: 'ADMIN',
  permissions: [],
}

const TRACK_ID = '1f2504e0-4f89-41d3-9a0c-0305e82c3311'

function detail(overrides: Partial<AlbumDetail> = {}): AlbumDetail {
  return {
    id: '9f2504e0-4f89-41d3-9a0c-0305e82c3301',
    title: 'Night Signal',
    artistId: '9f2504e0-4f89-41d3-9a0c-0305e82c3302',
    artistUsername: 'dj-test',
    coverUrl: null,
    type: 'ALBUM',
    totalTracks: 2,
    releaseDate: null,
    takenDownAt: null,
    createdAt: new Date('2026-09-01T09:59:00.000Z'),
    updatedAt: new Date('2026-09-01T09:59:00.000Z'),
    description: null,
    label: null,
    copyright: null,
    tracks: [
      {
        id: TRACK_ID,
        title: 'Intro',
        trackNumber: 1,
        discNumber: 1,
        processingStatus: 'READY',
        takenDownAt: null,
      },
      {
        id: '1f2504e0-4f89-41d3-9a0c-0305e82c3312',
        title: 'Outro',
        trackNumber: 2,
        discNumber: 1,
        processingStatus: 'READY',
        takenDownAt: new Date('2026-09-02T00:00:00.000Z'),
      },
    ],
    ...overrides,
  }
}

const getAlbum = vi.fn<() => Promise<AlbumDetail>>()
const takeDownAlbum = vi.fn<(input: unknown) => Promise<void>>()
const restoreAlbum = vi.fn<(input: unknown) => Promise<void>>()

function create(permissions: string[] = []): void {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    imports: [
      TranslocoTestingModule.forRoot({
        langs: { en: {}, uk: {} },
        translocoConfig: { availableLangs: [...LOCALES], defaultLang: DEFAULT_LOCALE },
      }),
    ],
    providers: [
      provideZonelessChangeDetection(),
      provideRouter([]),
      { provide: GetAlbumUseCase, useValue: { execute: getAlbum } },
      { provide: TakeDownAlbumUseCase, useValue: { execute: takeDownAlbum } },
      { provide: RestoreAlbumUseCase, useValue: { execute: restoreAlbum } },
    ],
  })
  TestBed.inject(SessionStore).set(
    permissions.length === 0
      ? ADMIN_STAFF
      : { ...ADMIN_STAFF, roleName: 'MODERATOR', permissions: permissions as never },
  )
}

function buttonLabelled(root: ParentNode, label: string): HTMLButtonElement | undefined {
  return Array.from(root.querySelectorAll('button')).find((b) => b.textContent?.trim() === label)
}

describe('AlbumDetailPage', () => {
  beforeEach(() => {
    getAlbum.mockReset()
    takeDownAlbum.mockReset()
    takeDownAlbum.mockResolvedValue(undefined)
    restoreAlbum.mockReset()
    restoreAlbum.mockResolvedValue(undefined)
  })

  it('lists the tracks in the order given, each linking to its catalog page and keeping its own state', async () => {
    getAlbum.mockResolvedValue(detail())
    create()

    const fixture = TestBed.createComponent(AlbumDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    const rows = host.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(2)
    expect(rows[0]?.textContent).toContain('Intro')
    expect(rows[0]?.querySelector('a')?.getAttribute('href')).toBe(`/catalog/${TRACK_ID}`)
    expect(rows[0]?.textContent).not.toContain('taken down')
    expect(rows[1]?.textContent).toContain('taken down')
  })

  it('shows the not-found message when the load rejects', async () => {
    getAlbum.mockRejectedValue(new Error('404'))
    create()

    const fixture = TestBed.createComponent(AlbumDetailPage)
    await fixture.whenStable()

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent,
    ).toContain('could not be found')
  })

  it('offers Take down, not Restore, for an active album', async () => {
    getAlbum.mockResolvedValue(detail())
    create()

    const fixture = TestBed.createComponent(AlbumDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    expect(buttonLabelled(host, 'Take down')).toBeDefined()
    expect(buttonLabelled(host, 'Restore')).toBeUndefined()
  })

  it('offers Restore, not Take down, for a taken-down album', async () => {
    getAlbum.mockResolvedValue(detail({ takenDownAt: new Date('2026-09-10T08:00:00.000Z') }))
    create()

    const fixture = TestBed.createComponent(AlbumDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    expect(buttonLabelled(host, 'Restore')).toBeDefined()
    expect(buttonLabelled(host, 'Take down')).toBeUndefined()
  })

  it('hides both actions from an operator holding only albums:read', async () => {
    getAlbum.mockResolvedValue(detail())
    create(['albums:read'])

    const fixture = TestBed.createComponent(AlbumDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    expect(buttonLabelled(host, 'Take down')).toBeUndefined()
    expect(buttonLabelled(host, 'Restore')).toBeUndefined()
    expect(host.textContent).toContain('No actions available.')
  })

  it('does not take the album down until the dialog is confirmed, then sends the typed reason', async () => {
    getAlbum.mockResolvedValue(detail())
    create()

    const fixture = TestBed.createComponent(AlbumDetailPage)
    await fixture.whenStable()

    buttonLabelled(fixture.nativeElement as HTMLElement, 'Take down')?.click()
    await fixture.whenStable()

    expect(takeDownAlbum).not.toHaveBeenCalled()
    expect(document.body.textContent).toContain('Its tracks are')

    const textarea = document.body.querySelector<HTMLTextAreaElement>('#album-action-reason')
    if (textarea) {
      textarea.value = ' rights claim '
      textarea.dispatchEvent(new Event('input'))
    }
    buttonLabelled(document.body, 'Yes, take down')?.click()
    await fixture.whenStable()

    expect(takeDownAlbum).toHaveBeenCalledWith({
      album: expect.objectContaining({ title: 'Night Signal' }),
      reason: 'rights claim',
    })
    expect(getAlbum).toHaveBeenCalledTimes(2)
  })

  it('shows the stale-state message and reloads when the album was already taken down elsewhere', async () => {
    getAlbum.mockResolvedValue(detail())
    takeDownAlbum.mockRejectedValue(new ResourceWriteError('already-deactivated'))
    create()

    const fixture = TestBed.createComponent(AlbumDetailPage)
    await fixture.whenStable()

    buttonLabelled(fixture.nativeElement as HTMLElement, 'Take down')?.click()
    await fixture.whenStable()
    buttonLabelled(document.body, 'Yes, take down')?.click()
    await fixture.whenStable()

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent,
    ).toContain('already taken down')
    expect(getAlbum).toHaveBeenCalledTimes(2)
  })

  it('restores a taken-down album after confirmation', async () => {
    getAlbum.mockResolvedValue(detail({ takenDownAt: new Date('2026-09-10T08:00:00.000Z') }))
    create()

    const fixture = TestBed.createComponent(AlbumDetailPage)
    await fixture.whenStable()

    buttonLabelled(fixture.nativeElement as HTMLElement, 'Restore')?.click()
    await fixture.whenStable()
    expect(restoreAlbum).not.toHaveBeenCalled()

    buttonLabelled(document.body, 'Yes, restore')?.click()
    await fixture.whenStable()

    expect(restoreAlbum).toHaveBeenCalledWith({
      album: expect.objectContaining({ title: 'Night Signal' }),
      reason: undefined,
    })
  })
})
