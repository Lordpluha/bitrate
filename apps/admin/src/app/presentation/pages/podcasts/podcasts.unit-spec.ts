import { provideLocationMocks } from '@angular/common/testing'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, type Routes } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import {
  type EpisodeTakeDownInput,
  type ListPodcastsQuery,
  type Podcast,
  type PodcastDetail,
  PodcastRepository,
} from '@domain/podcast'
import type { Page, TakeDownInput } from '@domain/shared'
import { TranslocoTestingModule } from '@jsverse/transloco'
import { DEFAULT_LOCALE, LOCALES } from '@presentation/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PodcastsPage } from './podcasts'

function podcast(overrides: Partial<Podcast> = {}): Podcast {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    title: 'Signal Hour',
    publisher: 'Bitrate FM',
    coverUrl: null,
    language: 'en',
    explicit: false,
    episodeCount: 3,
    takenDownAt: null,
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    updatedAt: new Date('2026-09-01T00:00:00.000Z'),
    ...overrides,
  }
}

const list = vi.fn<(query: ListPodcastsQuery) => Promise<Page<Podcast>>>()

class StubPodcastRepository extends PodcastRepository {
  override list(query: ListPodcastsQuery): Promise<Page<Podcast>> {
    return list(query)
  }

  override getById(_id: string): Promise<PodcastDetail> {
    throw new Error('not used')
  }

  override takeDown(_input: TakeDownInput): Promise<void> {
    throw new Error('not used')
  }

  override restore(_input: TakeDownInput): Promise<void> {
    throw new Error('not used')
  }

  override takeDownEpisode(_input: EpisodeTakeDownInput): Promise<void> {
    throw new Error('not used')
  }

  override restoreEpisode(_input: EpisodeTakeDownInput): Promise<void> {
    throw new Error('not used')
  }
}

const routes: Routes = [{ path: 'podcasts', component: PodcastsPage }]

describe('PodcastsPage', () => {
  let harness: RouterTestingHarness

  beforeEach(async () => {
    list.mockReset()
    list.mockResolvedValue({
      items: [
        podcast(),
        podcast({
          id: '9f2504e0-4f89-41d3-9a0c-0305e82c3302',
          title: 'Static Lines',
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
        { provide: PodcastRepository, useClass: StubPodcastRepository },
      ],
    })
    harness = await RouterTestingHarness.create()
  })

  it('lists active podcasts by default and flags a taken-down one when it is shown', async () => {
    await harness.navigateByUrl('/podcasts', PodcastsPage)
    await harness.fixture.whenStable()

    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, filter: expect.objectContaining({ status: 'active' }) }),
    )
    const rows = harness.routeNativeElement?.querySelectorAll('tbody tr') ?? []
    expect(rows).toHaveLength(2)
    expect(rows[0]?.textContent).toContain('Signal Hour')
    expect(rows[0]?.textContent).not.toContain('taken down')
    expect(rows[1]?.textContent).toContain('taken down')
  })

  it('links each podcast to its detail page', async () => {
    await harness.navigateByUrl('/podcasts', PodcastsPage)
    await harness.fixture.whenStable()

    const link = harness.routeNativeElement?.querySelector<HTMLAnchorElement>('tbody a')
    expect(link?.getAttribute('href')).toBe('/podcasts/3f2504e0-4f89-41d3-9a0c-0305e82c3301')
  })

  it('reads the take-down filter, search and sort from the URL', async () => {
    await harness.navigateByUrl(
      '/podcasts?resourceStatus=deactivated&q=signal&sort=title&dir=asc&page=2',
      PodcastsPage,
    )
    await harness.fixture.whenStable()

    expect(list).toHaveBeenCalledWith({
      page: 2,
      limit: 20,
      filter: {
        query: 'signal',
        status: 'deactivated',
        sort: { field: 'title', direction: 'asc' },
      },
    })
  })

  it('falls back to the active list when the URL carries an unknown status or sort field', async () => {
    await harness.navigateByUrl(
      '/podcasts?resourceStatus=bogus&sort=publisher&dir=asc',
      PodcastsPage,
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

    await harness.navigateByUrl('/podcasts', PodcastsPage)
    await harness.fixture.whenStable()

    expect(harness.routeNativeElement?.textContent).toContain('No podcasts match this filter.')
  })

  it('reports a failed load instead of an empty list', async () => {
    list.mockRejectedValue(new Error('boom'))

    await harness.navigateByUrl('/podcasts', PodcastsPage)
    await harness.fixture.whenStable()

    expect(harness.routeNativeElement?.textContent).toContain('Could not load podcasts.')
  })
})
