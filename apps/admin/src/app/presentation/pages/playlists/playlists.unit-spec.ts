import { provideLocationMocks } from '@angular/common/testing'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, type Routes } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import {
  type ListPlaylistsQuery,
  type Playlist,
  type PlaylistDetail,
  PlaylistRepository,
  type SetPlaylistVisibilityInput,
} from '@domain/playlist'
import type { Page, TakeDownInput } from '@domain/shared'
import { TranslocoTestingModule } from '@jsverse/transloco'
import { DEFAULT_LOCALE, LOCALES } from '@presentation/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PlaylistsPage } from './playlists'

function playlist(overrides: Partial<Playlist> = {}): Playlist {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    title: 'Night Drive',
    ownerId: '9f2504e0-4f89-41d3-9a0c-0305e82c3302',
    ownerUsername: 'listener',
    isPublic: true,
    followersCount: 3,
    trackCount: 2,
    takenDownAt: null,
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    updatedAt: new Date('2026-09-01T00:00:00.000Z'),
    ...overrides,
  }
}

const list = vi.fn<(query: ListPlaylistsQuery) => Promise<Page<Playlist>>>()

class StubPlaylistRepository extends PlaylistRepository {
  override list(query: ListPlaylistsQuery): Promise<Page<Playlist>> {
    return list(query)
  }

  override getById(_id: string): Promise<PlaylistDetail> {
    throw new Error('not used')
  }

  override setVisibility(_input: SetPlaylistVisibilityInput): Promise<void> {
    throw new Error('not used')
  }

  override takeDown(_input: TakeDownInput): Promise<void> {
    throw new Error('not used')
  }

  override restore(_input: TakeDownInput): Promise<void> {
    throw new Error('not used')
  }
}

const routes: Routes = [{ path: 'playlists', component: PlaylistsPage }]

describe('PlaylistsPage', () => {
  let harness: RouterTestingHarness

  beforeEach(async () => {
    list.mockReset()
    list.mockResolvedValue({
      items: [
        playlist(),
        playlist({
          id: '9f2504e0-4f89-41d3-9a0c-0305e82c3302',
          title: 'Spam Mix',
          takenDownAt: new Date('2026-09-05T00:00:00.000Z'),
        }),
      ],
      total: 2,
      page: 1,
      limit: 20,
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
        { provide: PlaylistRepository, useClass: StubPlaylistRepository },
      ],
    })
    harness = await RouterTestingHarness.create()
  })

  it('lists active playlists by default and flags a taken-down one when it is shown', async () => {
    await harness.navigateByUrl('/playlists', PlaylistsPage)
    await harness.fixture.whenStable()

    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, filter: expect.objectContaining({ status: 'active' }) }),
    )
    const rows = harness.routeNativeElement?.querySelectorAll('tbody tr') ?? []
    expect(rows).toHaveLength(2)
    expect(rows[0]?.textContent).toContain('Night Drive')
    expect(rows[0]?.textContent).not.toContain('taken down')
    expect(rows[1]?.textContent).toContain('taken down')
  })

  it('links each owner to their user page', async () => {
    await harness.navigateByUrl('/playlists', PlaylistsPage)
    await harness.fixture.whenStable()

    const links = harness.routeNativeElement?.querySelectorAll<HTMLAnchorElement>('tbody tr a')
    expect(links?.[1]?.getAttribute('href')).toBe('/users/9f2504e0-4f89-41d3-9a0c-0305e82c3302')
  })

  it('links each playlist to its detail page', async () => {
    await harness.navigateByUrl('/playlists', PlaylistsPage)
    await harness.fixture.whenStable()

    const link = harness.routeNativeElement?.querySelector<HTMLAnchorElement>('tbody a')
    expect(link?.getAttribute('href')).toBe('/playlists/3f2504e0-4f89-41d3-9a0c-0305e82c3301')
  })

  it('reads the take-down filter, owner and sort from the URL', async () => {
    await harness.navigateByUrl(
      '/playlists?resourceStatus=deactivated&ownerId=9f2504e0-4f89-41d3-9a0c-0305e82c3302&sort=title&dir=asc&page=2',
      PlaylistsPage,
    )
    await harness.fixture.whenStable()

    expect(list).toHaveBeenCalledWith({
      page: 2,
      limit: 20,
      filter: {
        query: undefined,
        status: 'deactivated',
        ownerId: '9f2504e0-4f89-41d3-9a0c-0305e82c3302',
        sort: { field: 'title', direction: 'asc' },
      },
    })
    expect(harness.routeNativeElement?.textContent).toContain('Clear owner filter')
  })

  it('falls back to the active list when the URL carries an unknown status or sort field', async () => {
    await harness.navigateByUrl(
      '/playlists?resourceStatus=bogus&sort=description&dir=asc',
      PlaylistsPage,
    )
    await harness.fixture.whenStable()

    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: expect.objectContaining({ status: 'active', sort: undefined }),
      }),
    )
  })

  it('shows the empty message when nothing matches', async () => {
    list.mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 })

    await harness.navigateByUrl('/playlists', PlaylistsPage)
    await harness.fixture.whenStable()

    expect(harness.routeNativeElement?.textContent).toContain('No playlists match this filter.')
  })

  it('reports a failed load instead of an empty list', async () => {
    list.mockRejectedValue(new Error('boom'))

    await harness.navigateByUrl('/playlists', PlaylistsPage)
    await harness.fixture.whenStable()

    expect(harness.routeNativeElement?.textContent).toContain('Could not load playlists.')
  })
})
