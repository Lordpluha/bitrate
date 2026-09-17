import { provideLocationMocks } from '@angular/common/testing'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, type Routes } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import type { Page } from '@domain/shared'
import { type ListTracksQuery, type Track, TrackRepository } from '@domain/track'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CatalogPage } from './catalog'

function track(overrides: Partial<Track> = {}): Track {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    title: 'Night Drive',
    artistUsername: 'dj-test',
    processingStatus: 'FAILED',
    processingError: 'timed out',
    processingAttempts: 3,
    processingStartedAt: null,
    processingFinishedAt: null,
    createdAt: new Date('2026-09-01T09:59:00.000Z'),
    ...overrides,
  }
}

const list = vi.fn<(query: ListTracksQuery) => Promise<Page<Track>>>()

class StubTrackRepository extends TrackRepository {
  override list(query: ListTracksQuery): Promise<Page<Track>> {
    return list(query)
  }

  override reprocess(_id: string): Promise<void> {
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
