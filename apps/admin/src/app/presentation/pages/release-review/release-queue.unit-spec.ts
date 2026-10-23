import { provideLocationMocks } from '@angular/common/testing'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, Router, type Routes } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import {
  type ListReleaseSubmissionsQuery,
  type ReleaseChangesRequest,
  type ReleaseDecisionRequest,
  ReleaseReviewRepository,
  type ReleaseSubmission,
  type ReleaseSubmissionDetail,
  type SubmissionReview,
} from '@domain/release-review'
import type { Page } from '@domain/shared'
import { provideTestTransloco } from '@testing/transloco'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ReleaseQueuePage } from './release-queue'

const list = vi.fn<(query: ListReleaseSubmissionsQuery) => Promise<Page<ReleaseSubmission>>>()

class StubReleaseRepository extends ReleaseReviewRepository {
  override list(query: ListReleaseSubmissionsQuery): Promise<Page<ReleaseSubmission>> {
    return list(query)
  }

  override getById(_id: string): Promise<ReleaseSubmissionDetail> {
    throw new Error('not used')
  }

  override audioUrl(): string {
    throw new Error('not used')
  }

  override approve(_input: ReleaseDecisionRequest): Promise<SubmissionReview> {
    throw new Error('not used')
  }

  override requestChanges(_input: ReleaseChangesRequest): Promise<SubmissionReview> {
    throw new Error('not used')
  }
}

function submission(overrides: Partial<ReleaseSubmission> = {}): ReleaseSubmission {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    title: 'Static Lines',
    kind: 'EP',
    status: 'SUBMITTED',
    coverUrl: null,
    submittedAt: new Date('2026-10-20T09:00:00.000Z'),
    updatedAt: new Date('2026-10-20T09:00:00.000Z'),
    artistId: '3f2504e0-4f89-41d3-9a0c-0305e82c3302',
    artistUsername: 'kite.harbor',
    trackCount: 5,
    ...overrides,
  }
}

const routes: Routes = [{ path: 'releases', component: ReleaseQueuePage }]

describe('ReleaseQueuePage', () => {
  let harness: RouterTestingHarness

  const host = () => harness.routeNativeElement as HTMLElement
  const tile = (label: string) =>
    Array.from(host().querySelectorAll('app-metric-tile')).find((candidate) =>
      candidate.textContent?.includes(label),
    )
  const buttonWith = (text: string) =>
    Array.from(host().querySelectorAll('button')).find((button) =>
      button.textContent?.includes(text),
    )
  const open = async (url = '/releases') => {
    await harness.navigateByUrl(url, ReleaseQueuePage)
    await harness.fixture.whenStable()
  }
  /** The queue's own page, and one-row answers for the KPI counts. */
  const serve = (rows: ReleaseSubmission[]) =>
    list.mockImplementation(({ limit, filter }) =>
      Promise.resolve(
        limit === 1
          ? {
              items: [submission()],
              total: filter.status === 'SUBMITTED' ? 7 : 3,
              page: 1,
              limit: 1,
            }
          : { items: rows, total: rows.length, page: 1, limit: limit ?? 20 },
      ),
    )

  beforeEach(async () => {
    list.mockReset()
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        ...provideTestTransloco(),
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideLocationMocks(),
        { provide: ReleaseReviewRepository, useClass: StubReleaseRepository },
      ],
    })
    harness = await RouterTestingHarness.create()
  })

  it('lists submissions with their type and status in plain words', async () => {
    serve([submission(), submission({ id: 'r2', title: 'Night Swim', status: 'REJECTED' })])
    await open()

    const table = host().querySelector('table')
    expect(table?.textContent).toContain('Static Lines')
    expect(table?.textContent).toContain('EP')
    expect(table?.textContent).toContain('Awaiting review')
    expect(table?.textContent).toContain('Changes requested')
    expect(host().textContent).toContain('1–2 of 2')
  })

  it('counts what awaits review and what waits on artists', async () => {
    serve([submission()])
    await open()

    expect(tile('Awaiting review')?.textContent).toContain('7')
    expect(tile('Awaiting review')?.textContent).toContain('Oldest')
    expect(tile('Changes requested')?.textContent).toContain('3')
  })

  it('opens on what awaits review, and narrows by status from the filter', async () => {
    serve([submission()])
    await open()
    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 20, filter: { query: undefined, status: 'SUBMITTED' } }),
    )

    buttonWith('Status:')?.click()
    await harness.fixture.whenStable()
    Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'))
      .find((item) => item.textContent?.includes('Approved'))
      ?.click()
    await harness.fixture.whenStable()

    expect(TestBed.inject(Router).url).toBe('/releases?status=READY')
  })

  it('names the search that found nothing and clears back to the queue', async () => {
    serve([])
    await open('/releases?q=orbit')

    expect(host().textContent).toContain('No releases match “orbit”')
    buttonWith('Clear filters')?.click()
    await harness.fixture.whenStable()

    expect(TestBed.inject(Router).url).toBe('/releases')
  })

  it('says there is nothing to review when the default queue is empty', async () => {
    serve([])
    await open()

    expect(host().textContent).toContain('Nothing to review')
    expect(buttonWith('Clear filters')).toBeUndefined()
  })

  it('reports a failed load as an alert with Try again', async () => {
    list.mockRejectedValue(new Error('down'))
    await open()

    expect(host().querySelector('[role="alert"]')?.textContent).toContain('Couldn’t load releases')
    expect(tile('Awaiting review')?.textContent).toContain('—')
    expect(buttonWith('Try again')).toBeDefined()
  })
})
