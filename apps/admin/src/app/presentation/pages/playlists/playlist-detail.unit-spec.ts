import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import {
  GetPlaylistUseCase,
  RestorePlaylistUseCase,
  SetPlaylistVisibilityUseCase,
  TakeDownPlaylistUseCase,
} from '@application/playlists'
import { SessionStore } from '@application/session'
import type { PlaylistDetail } from '@domain/playlist'
import { ResourceWriteError } from '@domain/shared'
import { TranslocoTestingModule } from '@jsverse/transloco'
import { DEFAULT_LOCALE, LOCALES } from '@presentation/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PlaylistDetailPage } from './playlist-detail'

const ADMIN_STAFF = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  email: 'ops@bitrate.me',
  username: 'ops',
  roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
  roleName: 'ADMIN',
  permissions: [],
}

const TRACK_ID = '1f2504e0-4f89-41d3-9a0c-0305e82c3311'
const OWNER_ID = '9f2504e0-4f89-41d3-9a0c-0305e82c3302'

function detail(overrides: Partial<PlaylistDetail> = {}): PlaylistDetail {
  return {
    id: '9f2504e0-4f89-41d3-9a0c-0305e82c3301',
    title: 'Night Drive',
    ownerId: OWNER_ID,
    ownerUsername: 'listener',
    isPublic: true,
    followersCount: 3,
    trackCount: 2,
    takenDownAt: null,
    createdAt: new Date('2026-09-01T09:59:00.000Z'),
    updatedAt: new Date('2026-09-01T09:59:00.000Z'),
    description: null,
    collaborative: false,
    tracks: [
      { id: TRACK_ID, title: 'Intro', position: 0 },
      { id: '1f2504e0-4f89-41d3-9a0c-0305e82c3312', title: 'Outro', position: 1 },
    ],
    ...overrides,
  }
}

const getPlaylist = vi.fn<() => Promise<PlaylistDetail>>()
const setVisibility = vi.fn<(input: unknown) => Promise<void>>()
const takeDownPlaylist = vi.fn<(input: unknown) => Promise<void>>()
const restorePlaylist = vi.fn<(input: unknown) => Promise<void>>()

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
      { provide: GetPlaylistUseCase, useValue: { execute: getPlaylist } },
      { provide: SetPlaylistVisibilityUseCase, useValue: { execute: setVisibility } },
      { provide: TakeDownPlaylistUseCase, useValue: { execute: takeDownPlaylist } },
      { provide: RestorePlaylistUseCase, useValue: { execute: restorePlaylist } },
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

async function render(): Promise<{
  host: HTMLElement
  settle: () => Promise<void>
}> {
  const fixture = TestBed.createComponent(PlaylistDetailPage)
  await fixture.whenStable()
  return { host: fixture.nativeElement as HTMLElement, settle: () => fixture.whenStable() }
}

describe('PlaylistDetailPage', () => {
  beforeEach(() => {
    for (const mock of [setVisibility, takeDownPlaylist, restorePlaylist]) {
      mock.mockReset()
      mock.mockResolvedValue(undefined)
    }
    getPlaylist.mockReset()
  })

  it('shows the owner linked to their user page and the tracks in order linking to the catalog', async () => {
    getPlaylist.mockResolvedValue(detail())
    create()

    const { host } = await render()

    expect(host.querySelector(`a[href="/users/${OWNER_ID}"]`)?.textContent).toContain('listener')
    const rows = host.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(2)
    expect(rows[0]?.textContent).toContain('Intro')
    expect(rows[0]?.querySelector('a')?.getAttribute('href')).toBe(`/catalog/${TRACK_ID}`)
    expect(host.textContent).toContain('public')
  })

  it('says when only the first tracks of a longer playlist are shown', async () => {
    getPlaylist.mockResolvedValue(detail({ trackCount: 120 }))
    create()

    const { host } = await render()

    expect(host.textContent).toContain('Showing the first 2 of 120 tracks.')
  })

  it('shows the not-found message when the load rejects', async () => {
    getPlaylist.mockRejectedValue(new Error('404'))
    create()

    const { host } = await render()

    expect(host.querySelector('[role="alert"]')?.textContent).toContain('could not be found')
  })

  it('offers Hide and Take down, not Un-hide or Restore, for an active public playlist', async () => {
    getPlaylist.mockResolvedValue(detail())
    create()

    const { host } = await render()

    expect(buttonLabelled(host, 'Hide')).toBeDefined()
    expect(buttonLabelled(host, 'Take down')).toBeDefined()
    expect(buttonLabelled(host, 'Un-hide')).toBeUndefined()
    expect(buttonLabelled(host, 'Restore')).toBeUndefined()
  })

  /** AC2: the two tiers are independent — a hidden, taken-down playlist offers both reversals. */
  it('offers Un-hide and Restore together for a hidden, taken-down playlist', async () => {
    getPlaylist.mockResolvedValue(
      detail({ isPublic: false, takenDownAt: new Date('2026-09-10T08:00:00.000Z') }),
    )
    create()

    const { host } = await render()

    expect(buttonLabelled(host, 'Un-hide')).toBeDefined()
    expect(buttonLabelled(host, 'Restore')).toBeDefined()
    expect(buttonLabelled(host, 'Hide')).toBeUndefined()
    expect(buttonLabelled(host, 'Take down')).toBeUndefined()
  })

  it('gives a moderator holding hide but not delete only the visibility action', async () => {
    getPlaylist.mockResolvedValue(detail())
    create(['playlists:read', 'playlists:hide'])

    const { host } = await render()

    expect(buttonLabelled(host, 'Hide')).toBeDefined()
    expect(buttonLabelled(host, 'Take down')).toBeUndefined()
  })

  it('hides every action from an operator holding only playlists:read', async () => {
    getPlaylist.mockResolvedValue(detail())
    create(['playlists:read'])

    const { host } = await render()

    expect(buttonLabelled(host, 'Hide')).toBeUndefined()
    expect(buttonLabelled(host, 'Take down')).toBeUndefined()
    expect(host.textContent).toContain('No actions available.')
  })

  it('does not hide until the dialog is confirmed, then sends isPublic false and the reason', async () => {
    getPlaylist.mockResolvedValue(detail())
    create()

    const { host, settle } = await render()
    buttonLabelled(host, 'Hide')?.click()
    await settle()

    expect(setVisibility).not.toHaveBeenCalled()
    expect(document.body.textContent).toContain('It is not deleted')

    const textarea = document.body.querySelector<HTMLTextAreaElement>('#playlist-action-reason')
    if (textarea) {
      textarea.value = ' misleading '
      textarea.dispatchEvent(new Event('input'))
    }
    buttonLabelled(document.body, 'Yes, hide')?.click()
    await settle()

    expect(setVisibility).toHaveBeenCalledWith({
      playlist: expect.objectContaining({ title: 'Night Drive' }),
      isPublic: false,
      reason: 'misleading',
    })
    expect(takeDownPlaylist).not.toHaveBeenCalled()
    expect(getPlaylist).toHaveBeenCalledTimes(2)
  })

  it('un-hides after confirmation without touching the take-down', async () => {
    getPlaylist.mockResolvedValue(
      detail({ isPublic: false, takenDownAt: new Date('2026-09-10T08:00:00.000Z') }),
    )
    create()

    const { host, settle } = await render()
    buttonLabelled(host, 'Un-hide')?.click()
    await settle()
    buttonLabelled(document.body, 'Yes, un-hide')?.click()
    await settle()

    expect(setVisibility).toHaveBeenCalledWith({
      playlist: expect.objectContaining({ title: 'Night Drive' }),
      isPublic: true,
      reason: undefined,
    })
    expect(restorePlaylist).not.toHaveBeenCalled()
  })

  it('takes down after confirmation without touching visibility', async () => {
    getPlaylist.mockResolvedValue(detail())
    create()

    const { host, settle } = await render()
    buttonLabelled(host, 'Take down')?.click()
    await settle()
    buttonLabelled(document.body, 'Yes, take down')?.click()
    await settle()

    expect(takeDownPlaylist).toHaveBeenCalledWith({
      playlist: expect.objectContaining({ title: 'Night Drive' }),
      reason: undefined,
    })
    expect(setVisibility).not.toHaveBeenCalled()
  })

  it('restores after confirmation without touching visibility', async () => {
    getPlaylist.mockResolvedValue(
      detail({ isPublic: false, takenDownAt: new Date('2026-09-10T08:00:00.000Z') }),
    )
    create()

    const { host, settle } = await render()
    buttonLabelled(host, 'Restore')?.click()
    await settle()
    expect(restorePlaylist).not.toHaveBeenCalled()
    buttonLabelled(document.body, 'Yes, restore')?.click()
    await settle()

    expect(restorePlaylist).toHaveBeenCalledWith({
      playlist: expect.objectContaining({ title: 'Night Drive' }),
      reason: undefined,
    })
    expect(setVisibility).not.toHaveBeenCalled()
  })

  it('shows the visibility-conflict message and reloads when the API refuses an un-hide', async () => {
    getPlaylist.mockResolvedValue(detail({ isPublic: false }))
    setVisibility.mockRejectedValue(new ResourceWriteError('visibility-conflict'))
    create()

    const { host, settle } = await render()
    buttonLabelled(host, 'Un-hide')?.click()
    await settle()
    buttonLabelled(document.body, 'Yes, un-hide')?.click()
    await settle()

    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      'cannot be un-hidden by an operator',
    )
    expect(getPlaylist).toHaveBeenCalledTimes(2)
  })

  it('shows the stale-state message when the playlist was already taken down elsewhere', async () => {
    getPlaylist.mockResolvedValue(detail())
    takeDownPlaylist.mockRejectedValue(new ResourceWriteError('already-deactivated'))
    create()

    const { host, settle } = await render()
    buttonLabelled(host, 'Take down')?.click()
    await settle()
    buttonLabelled(document.body, 'Yes, take down')?.click()
    await settle()

    expect(host.querySelector('[role="alert"]')?.textContent).toContain('already taken down')
    expect(getPlaylist).toHaveBeenCalledTimes(2)
  })
})
