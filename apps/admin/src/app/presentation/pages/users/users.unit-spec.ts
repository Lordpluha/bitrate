import { Location } from '@angular/common'
import { provideLocationMocks } from '@angular/common/testing'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, type Routes } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { SessionStore } from '@application/session'
import type { BatchResult, Page, TakeDownInput } from '@domain/shared'
import {
  type ListeningHistoryEntry,
  type ListUsersQuery,
  type User,
  type UserDetail,
  UserRepository,
} from '@domain/user'
import type { Permission } from '@domain/access'
import { ExportRepository } from '@domain/export'
import { FileSaver } from '@presentation/components'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UsersPage } from './users'
import { TranslocoTestingModule } from '@jsverse/transloco'
import { DEFAULT_LOCALE, LOCALES } from '@presentation/navigation'

function user(overrides: Partial<User> = {}): User {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    username: 'listener-1',
    email: 'listener@example.com',
    emailVerifiedAt: null,
    createdAt: new Date('2026-09-01T09:59:00.000Z'),
    deactivatedAt: null,
    ...overrides,
  }
}

const list = vi.fn<(query: ListUsersQuery) => Promise<Page<User>>>()
const deactivateMany = vi.fn<(ids: readonly string[]) => Promise<BatchResult>>()

/** A stub of the port — only `list` is exercised by this page's specs. */
class StubUserRepository extends UserRepository {
  override list(query: ListUsersQuery): Promise<Page<User>> {
    return list(query)
  }

  override getById(_id: string): Promise<UserDetail> {
    throw new Error('not used')
  }

  override deactivate(_input: TakeDownInput): Promise<void> {
    throw new Error('not used')
  }

  override deactivateMany(ids: readonly string[]): Promise<BatchResult> {
    return deactivateMany(ids)
  }

  override restore(_input: TakeDownInput): Promise<void> {
    throw new Error('not used')
  }

  override revokeSessions(_input: TakeDownInput): Promise<number> {
    throw new Error('not used')
  }

  override listListeningHistory(
    _userId: string,
    _page: number,
  ): Promise<Page<ListeningHistoryEntry>> {
    throw new Error('not used')
  }
}

const exportUsers = vi.fn<ExportRepository['exportUsers']>()

/** Only the export this page uses is exercised; the others fail loudly if reached. */
class StubExportRepository extends ExportRepository {
  override exportUsers(...args: Parameters<ExportRepository['exportUsers']>) {
    return exportUsers(...args)
  }

  override exportArtists(): ReturnType<ExportRepository['exportArtists']> {
    throw new Error('not used')
  }

  override exportTracks(): ReturnType<ExportRepository['exportTracks']> {
    throw new Error('not used')
  }

  override exportReports(): ReturnType<ExportRepository['exportReports']> {
    throw new Error('not used')
  }
}

const routes: Routes = [{ path: 'users', component: UsersPage }]

describe('UsersPage', () => {
  let harness: RouterTestingHarness

  beforeEach(async () => {
    list.mockReset()
    list.mockResolvedValue({ items: [user()], total: 1, page: 1, limit: 20 })

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
        provideRouter(routes),
        provideLocationMocks(),
        { provide: UserRepository, useClass: StubUserRepository },
        { provide: ExportRepository, useClass: StubExportRepository },
      ],
    })
    harness = await RouterTestingHarness.create()
  })

  it('links a listener row to its detail route', async () => {
    await harness.navigateByUrl('/users', UsersPage)
    await harness.fixture.whenStable()

    const link = harness.routeNativeElement?.querySelector<HTMLAnchorElement>(
      'tbody a[href="/users/3f2504e0-4f89-41d3-9a0c-0305e82c3301"]',
    )
    expect(link?.textContent?.trim()).toBe('listener-1')
  })

  it('patches the URL with a status filter and resets to page one', async () => {
    await harness.navigateByUrl('/users?page=3', UsersPage)
    await harness.fixture.whenStable()

    harness.routeNativeElement
      ?.querySelectorAll<HTMLButtonElement>('[aria-label="Filter by status"] button')[1]
      ?.click()
    await harness.fixture.whenStable()

    const location = TestBed.inject(Location)
    expect(location.path()).toBe('/users?status=deactivated')
    expect(list).toHaveBeenLastCalledWith(
      expect.objectContaining({
        page: 1,
        filter: expect.objectContaining({ status: 'deactivated' }),
      }),
    )
  })

  describe('batch deactivate', () => {
    const FIRST = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'
    const SECOND = '3f2504e0-4f89-41d3-9a0c-0305e82c3302'
    const GONE = '3f2504e0-4f89-41d3-9a0c-0305e82c3303'

    const operator = (permissions: Permission[]) =>
      TestBed.inject(SessionStore).set({
        id: '3f2504e0-4f89-41d3-9a0c-0305e82c3399',
        email: 'ops@bitrate.me',
        username: 'ops',
        roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
        roleName: 'MODERATOR',
        permissions,
      })

    const host = () => harness.routeNativeElement as HTMLElement
    const checkbox = (label: string) =>
      host().querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)
    const tick = async (label: string) => {
      checkbox(label)?.click()
      await harness.fixture.whenStable()
    }
    const bar = () => host().querySelector('[aria-label="Batch actions"]')
    const dialog = () => document.body.querySelector('[data-slot="dialog-content"]')
    const button = (root: ParentNode | null, text: string) =>
      Array.from(root?.querySelectorAll<HTMLButtonElement>('button') ?? []).find((candidate) =>
        candidate.textContent?.trim().startsWith(text),
      )

    beforeEach(() => {
      deactivateMany.mockReset()
      list.mockResolvedValue({
        items: [
          user({ id: FIRST, username: 'first' }),
          user({ id: SECOND, username: 'second' }),
          user({ id: GONE, username: 'gone', deactivatedAt: new Date('2026-09-02T00:00:00.000Z') }),
        ],
        total: 3,
        page: 1,
        limit: 20,
      })
    })

    it('shows no checkboxes or bar to an operator without users:delete', async () => {
      operator(['users:read'])
      await harness.navigateByUrl('/users', UsersPage)
      await harness.fixture.whenStable()

      expect(host().querySelectorAll('input[type="checkbox"]')).toHaveLength(0)
      expect(bar()).toBeNull()
    })

    it('shows the bar with the selected count once a row is ticked', async () => {
      operator(['users:read', 'users:delete'])
      await harness.navigateByUrl('/users', UsersPage)
      await harness.fixture.whenStable()
      expect(bar()).toBeNull()

      await tick('Select first')
      await tick('Select second')

      expect(bar()?.textContent).toContain('2 listeners selected')
    })

    it('does not let an already deactivated row be selected, and select-all skips it', async () => {
      operator(['users:read', 'users:delete'])
      await harness.navigateByUrl('/users', UsersPage)
      await harness.fixture.whenStable()

      expect(checkbox('Select gone')?.disabled).toBe(true)

      await tick('Select all listeners on this page')

      expect(bar()?.textContent).toContain('2 listeners selected')
    })

    it('confirms against every selected row, then shows a per-row result and reloads', async () => {
      operator(['users:read', 'users:delete'])
      deactivateMany.mockResolvedValue({
        items: [
          { id: FIRST, outcome: 'succeeded' },
          {
            id: SECOND,
            outcome: 'failed',
            failure: { code: 'CONFLICT', message: 'User is already deleted' },
          },
        ],
        succeeded: 1,
        failed: 1,
      })
      await harness.navigateByUrl('/users', UsersPage)
      await harness.fixture.whenStable()
      await tick('Select all listeners on this page')

      button(bar(), 'Deactivate')?.click()
      await harness.fixture.whenStable()

      const confirm = dialog()
      const listed = Array.from(confirm?.querySelectorAll('li') ?? []).map((li) =>
        li.textContent?.trim(),
      )
      expect(listed).toEqual(['first', 'second'])
      expect(deactivateMany).not.toHaveBeenCalled()

      list.mockClear()
      button(confirm, 'Deactivate listeners')?.click()
      await harness.fixture.whenStable()

      expect(deactivateMany).toHaveBeenCalledWith([FIRST, SECOND])
      expect(list).toHaveBeenCalledTimes(1)
      const summary = dialog()
      expect(summary?.textContent).toContain('1 succeeded, 1 failed')
      expect(summary?.textContent).toContain('second')
      expect(summary?.textContent).toContain('User is already deleted')
      expect(bar()).toBeNull()
    })

    it('clears the selection when the filter changes', async () => {
      operator(['users:read', 'users:delete'])
      await harness.navigateByUrl('/users', UsersPage)
      await harness.fixture.whenStable()
      await tick('Select first')
      expect(bar()).not.toBeNull()

      host()
        .querySelectorAll<HTMLButtonElement>('[aria-label="Filter by status"] button')[2]
        ?.click()
      await harness.fixture.whenStable()

      expect(bar()).toBeNull()
    })
  })
})

describe('UsersPage — CSV export', () => {
  let harness: RouterTestingHarness

  const operator = (permissions: Permission[]) =>
    TestBed.inject(SessionStore).set({
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3399',
      email: 'ops@bitrate.me',
      username: 'ops',
      roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
      roleName: 'MODERATOR',
      permissions,
    })
  const exportButton = () =>
    Array.from(
      (harness.routeNativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'),
    ).find((candidate) => candidate.textContent?.trim().startsWith('Export CSV'))

  beforeEach(async () => {
    list.mockReset()
    exportUsers.mockReset()
    list.mockResolvedValue({ items: [user()], total: 1, page: 1, limit: 20 })
    exportUsers.mockResolvedValue({
      blob: new Blob(['id\r\n']),
      filename: 'export.csv',
      truncated: false,
    })

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
        provideRouter(routes),
        provideLocationMocks(),
        { provide: UserRepository, useClass: StubUserRepository },
        { provide: ExportRepository, useClass: StubExportRepository },
        { provide: FileSaver, useValue: { save: vi.fn() } },
      ],
    })
    harness = await RouterTestingHarness.create()
  })

  it('offers no export to an operator without users:export', async () => {
    operator(['users:read'])
    await harness.navigateByUrl('/users', UsersPage)
    await harness.fixture.whenStable()

    expect(exportButton()).toBeUndefined()
  })

  it('offers the export to an operator with users:export', async () => {
    operator(['users:read', 'users:export'])
    await harness.navigateByUrl('/users', UsersPage)
    await harness.fixture.whenStable()

    expect(exportButton()).toBeDefined()
  })

  it('exports the filters and sort in the URL, not the loaded page', async () => {
    operator(['users:read', 'users:export'])
    await harness.navigateByUrl('/users?q=ann&status=all&sort=email&dir=desc&page=2', UsersPage)
    await harness.fixture.whenStable()

    exportButton()?.click()
    await harness.fixture.whenStable()

    expect(exportUsers).toHaveBeenCalledTimes(1)
    expect(exportUsers).toHaveBeenCalledWith({
      query: 'ann',
      status: 'all',
      sort: { field: 'email', direction: 'desc' },
    })
  })
})
