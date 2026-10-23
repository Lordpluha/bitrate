import { Location } from '@angular/common'
import { provideLocationMocks } from '@angular/common/testing'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, type Routes } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { GetArtistStatsUseCase } from '@application/artists'
import { ListReportsUseCase } from '@application/moderation'
import {
  GetOverviewReportsByTypeUseCase,
  GetOverviewSeriesUseCase,
  GetOverviewUseCase,
} from '@application/overview'
import { GetReleaseQueueStatsUseCase } from '@application/release-review'
import { SessionStore } from '@application/session'
import { GetUserStatsUseCase } from '@application/users'
import type { Overview, OverviewReportsByType, OverviewSeries } from '@domain/overview'
import type { Staff } from '@domain/staff'
import { provideTestTransloco } from '@testing/transloco'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OverviewPage } from './overview'

const ADMIN_STAFF: Staff = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  email: 'ops@bitrate.me',
  username: 'ops',
  roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
  roleName: 'ADMIN',
  permissions: [],
}

const DAY = new Date('2026-09-17T00:00:00.000Z')

function overview(overrides: Partial<Overview> = {}): Overview {
  return {
    reports: { open: 3, reviewing: 1 },
    tracks: { processing: 2, ready: 50, failed: 4, stuck: 1, stuckAfterMs: 1_800_000 },
    deactivated: { users: 2, artists: 0 },
    last7Days: { signups: 5, uploads: 12 },
    recentActivity: [
      {
        id: 'a1b2c3d4-4f89-41d3-9a0c-0305e82c3301',
        action: 'admin-tracks.reprocess',
        entityType: 'admin-tracks',
        entityId: null,
        actorUsername: 'fixture-moderator',
        ipAddress: null,
        createdAt: new Date('2026-09-17T12:00:00.000Z'),
      },
    ],
    ...overrides,
  }
}

function series(): OverviewSeries {
  return {
    from: new Date('2026-08-19T00:00:00.000Z'),
    to: DAY,
    days: 30,
    uploads: [{ date: DAY, uploaded: 4, ready: 3, failed: 1, stuck: 0 }],
    signups: [{ date: DAY, listeners: 2, artists: 1 }],
    listens: [{ date: DAY, count: 40 }],
    reports: [{ date: DAY, count: 1 }],
    reportsByStatus: { open: 3, reviewing: 1, resolved: 2, rejected: 0 },
  }
}

function byType(): OverviewReportsByType {
  return {
    from: new Date('2026-08-19T00:00:00.000Z'),
    to: DAY,
    days: 30,
    dates: [DAY],
    series: [
      { entityType: 'track', counts: [5], total: 5 },
      { entityType: 'playlist', counts: [2], total: 2 },
    ],
    total: 7,
  }
}

const execute = vi.fn<() => Promise<Overview>>()
const executeSeries = vi.fn<(days: number) => Promise<OverviewSeries>>()
const executeByType = vi.fn<(days: number) => Promise<OverviewReportsByType>>()

const routes: Routes = [{ path: '', component: OverviewPage }]

async function configure(staff: Staff = ADMIN_STAFF): Promise<RouterTestingHarness> {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [
      ...provideTestTransloco(),
      provideZonelessChangeDetection(),
      provideRouter(routes),
      provideLocationMocks(),
      { provide: GetOverviewUseCase, useValue: { execute } },
      { provide: GetOverviewSeriesUseCase, useValue: { execute: executeSeries } },
      { provide: GetOverviewReportsByTypeUseCase, useValue: { execute: executeByType } },
      {
        provide: GetUserStatsUseCase,
        useValue: { execute: () => Promise.resolve({ live: 1200, takenDown: 9 }) },
      },
      {
        provide: GetArtistStatsUseCase,
        useValue: {
          execute: () => Promise.resolve({ live: 80, takenDown: 1, verified: 60, unverified: 20 }),
        },
      },
      {
        provide: GetReleaseQueueStatsUseCase,
        useValue: {
          execute: () =>
            Promise.resolve({ awaiting: 7, changesRequested: 2, oldestAwaitingAt: null }),
        },
      },
      {
        provide: ListReportsUseCase,
        useValue: {
          execute: () => Promise.resolve({ items: [], total: 0, page: 1, limit: 20 }),
        },
      },
    ],
  })
  TestBed.inject(SessionStore).set(staff)
  return RouterTestingHarness.create()
}

/** Lets the range requests, started by an effect after the first render, settle too. */
async function settle(harness: RouterTestingHarness): Promise<void> {
  await harness.fixture.whenStable()
  await new Promise((resolve) => setTimeout(resolve))
  await harness.fixture.whenStable()
}

function text(harness: RouterTestingHarness): string {
  return (harness.routeNativeElement as HTMLElement).textContent ?? ''
}

describe('OverviewPage', () => {
  beforeEach(() => {
    execute.mockReset().mockResolvedValue(overview())
    executeSeries.mockReset().mockResolvedValue(series())
    executeByType.mockReset().mockResolvedValue(byType())
  })

  it('sums what waits on staff across the queues the role can see', async () => {
    const harness = await configure()
    await harness.navigateByUrl('/', OverviewPage)
    await settle(harness)

    /** 3 open + 1 in review + 7 releases + 4 failed + 1 stuck. */
    expect(text(harness)).toContain('16 items waiting on staff')
    expect(text(harness)).toContain('Releases awaiting review')
    expect(text(harness)).toContain('1,200')
  })

  it('locks a tile whose source the role cannot read, instead of showing a zero', async () => {
    const harness = await configure({
      ...ADMIN_STAFF,
      roleName: 'MODERATOR',
      permissions: ['overview:read', 'reports:read'],
    })
    await harness.navigateByUrl('/', OverviewPage)
    await settle(harness)

    expect(text(harness)).toContain('Needs users:read')
    expect(text(harness)).not.toContain('Releases awaiting review')
  })

  it('shows a retryable error when the overview fails, then the tiles once it loads', async () => {
    execute.mockRejectedValueOnce(new Error('down'))
    const harness = await configure()
    await harness.navigateByUrl('/', OverviewPage)
    await settle(harness)

    expect(text(harness)).toContain('We couldn’t load the overview')

    Array.from((harness.routeNativeElement as HTMLElement).querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Try again'))
      ?.click()
    await settle(harness)

    expect(text(harness)).not.toContain('We couldn’t load the overview')
    expect(text(harness)).toContain('Reports to review')
  })

  it('re-requests the charts at the newly selected range, through the URL', async () => {
    const harness = await configure()
    await harness.navigateByUrl('/', OverviewPage)
    await settle(harness)
    expect(executeSeries).toHaveBeenLastCalledWith(30)

    Array.from((harness.routeNativeElement as HTMLElement).querySelectorAll('button'))
      .find((button) => button.textContent?.trim() === '7d')
      ?.click()
    await settle(harness)

    expect(TestBed.inject(Location).path()).toBe('/?days=7')
    expect(executeSeries).toHaveBeenLastCalledWith(7)
    expect(executeByType).toHaveBeenLastCalledWith(7)
  })

  it('keeps the overview tiles when only the range charts fail', async () => {
    executeSeries.mockRejectedValue(new Error('series down'))
    const harness = await configure()
    await harness.navigateByUrl('/', OverviewPage)
    await settle(harness)

    expect(text(harness)).toContain('Couldn’t load this tile')
    expect(text(harness)).toContain('Reports to review')
  })

  it('opens a tile’s analysis panel from the URL, with figures from the range', async () => {
    const harness = await configure()
    await harness.navigateByUrl('/?panel=reports', OverviewPage)
    await settle(harness)

    const dialog = document.body.querySelector('[role="dialog"]')
    expect(dialog?.textContent).toContain('Reports by type')
    expect(dialog?.textContent).toContain('Most reported')
    expect(dialog?.textContent).toContain('Tracks')
  })

  it('opens a panel from its tile button and writes it to the URL', async () => {
    const harness = await configure()
    await harness.navigateByUrl('/', OverviewPage)
    await settle(harness)

    ;(
      (harness.routeNativeElement as HTMLElement).querySelector(
        'button[aria-label="Open analysis: Listens per day"]',
      ) as HTMLButtonElement
    ).click()
    await settle(harness)

    expect(TestBed.inject(Location).path()).toBe('/?panel=listens')
    expect(document.body.querySelector('[role="dialog"]')?.textContent).toContain('Total listens')
  })
})
