import { provideLocationMocks } from '@angular/common/testing'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, type Routes } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { SessionStore } from '@application/session'
import type { Permission } from '@domain/access'
import type { BatchResult, Page, TakeDownInput } from '@domain/shared'
import {
  type ListTracksQuery,
  type ProbeTrackAudioInput,
  type ProcessingAttempt,
  type Track,
  type TrackAudioSource,
  type TrackDetail,
  TrackRepository,
} from '@domain/track'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CatalogPage } from './catalog'
import { TranslocoTestingModule } from '@jsverse/transloco'
import { DEFAULT_LOCALE, LOCALES } from '@presentation/navigation'

function track(overrides: Partial<Track> = {}): Track {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    title: 'Night Drive',
    artistUsername: 'dj-test',
    coverUrl: null,
    processingStatus: 'FAILED',
    processingError: 'timed out',
    processingAttempts: 3,
    processingStartedAt: null,
    processingFinishedAt: null,
    updatedAt: new Date('2026-09-01T09:59:00.000Z'),
    takenDownAt: null,
    createdAt: new Date('2026-09-01T09:59:00.000Z'),
    ...overrides,
  }
}

const list = vi.fn<(query: ListTracksQuery) => Promise<Page<Track>>>()
const takeDownMany = vi.fn<(ids: readonly string[]) => Promise<BatchResult>>()

class StubTrackRepository extends TrackRepository {
  override list(query: ListTracksQuery): Promise<Page<Track>> {
    return list(query)
  }

  override getById(_id: string): Promise<TrackDetail> {
    throw new Error('not used')
  }

  override reprocess(_id: string): Promise<void> {
    throw new Error('not used')
  }

  override takeDown(_input: TakeDownInput): Promise<void> {
    throw new Error('not used')
  }

  override takeDownMany(ids: readonly string[]): Promise<BatchResult> {
    return takeDownMany(ids)
  }

  override restore(_input: TakeDownInput): Promise<void> {
    throw new Error('not used')
  }

  override listProcessingAttempts(
    _trackId: string,
    _page: number,
  ): Promise<Page<ProcessingAttempt>> {
    throw new Error('not used')
  }

  override probeAudio(_input: ProbeTrackAudioInput): Promise<TrackAudioSource> {
    throw new Error('not used')
  }
}

const routes: Routes = [{ path: 'catalog', component: CatalogPage }]
const ATTENTION_NOTE = 'Ordered by what needs attention'

describe('CatalogPage — attention-first default', () => {
  let harness: RouterTestingHarness

  beforeEach(async () => {
    list.mockReset()
    list.mockResolvedValue({ items: [track()], total: 1, page: 1, limit: 20 })

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
        { provide: TrackRepository, useClass: StubTrackRepository },
      ],
    })
    harness = await RouterTestingHarness.create()
  })

  it('explains the attention-first order when unsorted', async () => {
    await harness.navigateByUrl('/catalog', CatalogPage)
    await harness.fixture.whenStable()

    expect(harness.routeNativeElement?.textContent).toContain(ATTENTION_NOTE)
  })

  it('hides the explanation once a sort is chosen', async () => {
    await harness.navigateByUrl('/catalog?sort=title&dir=asc', CatalogPage)
    await harness.fixture.whenStable()

    expect(harness.routeNativeElement?.textContent).not.toContain(ATTENTION_NOTE)
  })

  it('brings the explanation back, and drops sort/order from the request, once the sort is cleared', async () => {
    await harness.navigateByUrl('/catalog?sort=title&dir=asc', CatalogPage)
    await harness.fixture.whenStable()

    harness.routeNativeElement?.querySelector<HTMLButtonElement>('app-sort-header button')?.click()
    await harness.fixture.whenStable()

    harness.routeNativeElement?.querySelector<HTMLButtonElement>('app-sort-header button')?.click()
    await harness.fixture.whenStable()

    expect(harness.routeNativeElement?.textContent).toContain(ATTENTION_NOTE)
    expect(list).toHaveBeenLastCalledWith(
      expect.objectContaining({ filter: expect.objectContaining({ sort: undefined }) }),
    )
  })
})

describe('CatalogPage — batch take-down', () => {
  const FIRST = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'
  const SECOND = '3f2504e0-4f89-41d3-9a0c-0305e82c3302'
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
  const host = () => harness.routeNativeElement as HTMLElement
  const bar = () => host().querySelector('[aria-label="Batch actions"]')
  const dialog = () => document.body.querySelector('[data-slot="dialog-content"]')
  const button = (root: ParentNode | null, text: string) =>
    Array.from(root?.querySelectorAll<HTMLButtonElement>('button') ?? []).find((candidate) =>
      candidate.textContent?.trim().startsWith(text),
    )

  beforeEach(async () => {
    list.mockReset()
    takeDownMany.mockReset()
    list.mockResolvedValue({
      items: [
        track({ id: FIRST, title: 'Night Drive' }),
        track({ id: SECOND, title: 'Day Drive' }),
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
        { provide: TrackRepository, useClass: StubTrackRepository },
      ],
    })
    harness = await RouterTestingHarness.create()
  })

  it('offers no checkboxes to an operator without tracks:delete', async () => {
    operator(['tracks:read'])
    await harness.navigateByUrl('/catalog', CatalogPage)
    await harness.fixture.whenStable()

    expect(host().querySelectorAll('input[type="checkbox"]')).toHaveLength(0)
  })

  it('lists every selected title in the confirm dialog and summarises per-row results', async () => {
    operator(['tracks:read', 'tracks:delete'])
    takeDownMany.mockResolvedValue({
      items: [
        { id: FIRST, outcome: 'succeeded' },
        { id: SECOND, outcome: 'failed', failure: { code: 'NOT_FOUND', message: 'Track gone' } },
      ],
      succeeded: 1,
      failed: 1,
    })
    await harness.navigateByUrl('/catalog', CatalogPage)
    await harness.fixture.whenStable()

    host()
      .querySelector<HTMLInputElement>('input[aria-label="Select all tracks on this page"]')
      ?.click()
    await harness.fixture.whenStable()
    expect(bar()?.textContent).toContain('2 tracks selected')

    button(bar(), 'Take down')?.click()
    await harness.fixture.whenStable()
    const confirm = dialog()
    expect(
      Array.from(confirm?.querySelectorAll('li') ?? []).map((li) => li.textContent?.trim()),
    ).toEqual(['Night Drive', 'Day Drive'])

    button(confirm, 'Take down tracks')?.click()
    await harness.fixture.whenStable()

    expect(takeDownMany).toHaveBeenCalledWith([FIRST, SECOND])
    expect(dialog()?.textContent).toContain('1 succeeded, 1 failed')
    expect(dialog()?.textContent).toContain('Track gone')
  })
})
