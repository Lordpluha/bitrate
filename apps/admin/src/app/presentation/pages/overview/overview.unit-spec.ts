import { Location } from '@angular/common'
import { provideLocationMocks } from '@angular/common/testing'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, type Routes } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { GetOverviewSeriesUseCase, GetOverviewUseCase } from '@application/overview'
import { SessionStore } from '@application/session'
import type { Overview, OverviewSeries } from '@domain/overview'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OverviewPage } from './overview'

const ADMIN_STAFF = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  email: 'ops@bitrate.me',
  username: 'ops',
  roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
  roleName: 'ADMIN',
  permissions: [],
}

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

function series(overrides: Partial<OverviewSeries> = {}): OverviewSeries {
  return {
    from: new Date('2026-08-19T00:00:00.000Z'),
    to: new Date('2026-09-17T00:00:00.000Z'),
    days: 30,
    uploads: [
      { date: new Date('2026-09-17T00:00:00.000Z'), uploaded: 4, ready: 3, failed: 1, stuck: 0 },
    ],
    signups: [{ date: new Date('2026-09-17T00:00:00.000Z'), listeners: 2, artists: 1 }],
    listens: [{ date: new Date('2026-09-17T00:00:00.000Z'), count: 40 }],
    reports: [{ date: new Date('2026-09-17T00:00:00.000Z'), count: 1 }],
    reportsByStatus: { open: 3, reviewing: 1, resolved: 2, rejected: 0 },
    ...overrides,
  }
}

const execute = vi.fn<() => Promise<Overview>>()
const executeSeries = vi.fn<(days: number) => Promise<OverviewSeries>>()

const routes: Routes = [{ path: '', component: OverviewPage }]

describe('OverviewPage', () => {
  let harness: RouterTestingHarness

  beforeEach(async () => {
    execute.mockReset()
    executeSeries.mockReset()
    executeSeries.mockResolvedValue(series())

    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideLocationMocks(),
        { provide: GetOverviewUseCase, useValue: { execute } },
        { provide: GetOverviewSeriesUseCase, useValue: { execute: executeSeries } },
      ],
    })
    /** ADMIN sees every guarded tile by identity — see `hasPermission`. */
    TestBed.inject(SessionStore).set(ADMIN_STAFF)
    harness = await RouterTestingHarness.create()
  })

  it('renders every tile in a list, with a link where the target list can filter for it', async () => {
    execute.mockResolvedValue(overview())

    const host = await harness.navigateByUrl('/', OverviewPage)
    await harness.fixture.whenStable()

    expect(host).not.toBeNull()
    const root = harness.routeNativeElement as HTMLElement

    expect(root.querySelectorAll('ul > li').length).toBeGreaterThanOrEqual(9)
    expect(root.textContent).toContain('Open reports')
    expect(root.textContent).toContain('Failed tracks')
    expect(root.textContent).toContain('Stuck tracks')

    const openReportsLink = Array.from(root.querySelectorAll('a')).find((a) =>
      a.textContent?.includes('Open reports'),
    )
    /** `OPEN` is the moderation codec's own default, so the canonical link carries no query params. */
    expect(openReportsLink?.getAttribute('href')).toBe('/moderation')
  })

  it('gives the tile grid an accessible heading, and keeps h1 -> h2 order', async () => {
    execute.mockResolvedValue(overview())

    await harness.navigateByUrl('/', OverviewPage)
    await harness.fixture.whenStable()

    const root = harness.routeNativeElement as HTMLElement
    const h1 = root.querySelector('h1')
    const headings = Array.from(root.querySelectorAll('h1, h2, h3'))

    expect(h1?.textContent).toContain('Overview')
    expect(headings.map((heading) => heading.tagName)[0]).toBe('H1')

    const grid = root.querySelector('ul[aria-labelledby="dashboard-summary-heading"]')
    expect(grid).not.toBeNull()
    expect(document.getElementById('dashboard-summary-heading')).not.toBeNull()
  })

  it('shows a failure message when the load rejects, instead of throwing', async () => {
    execute.mockRejectedValue(new Error('network down'))

    await harness.navigateByUrl('/', OverviewPage)
    await harness.fixture.whenStable()

    const root = harness.routeNativeElement as HTMLElement

    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Could not load the dashboard.',
    )
  })

  it('keeps the previously loaded tiles on screen when a reload fails, alongside the alert', async () => {
    execute.mockResolvedValueOnce(overview())

    await harness.navigateByUrl('/', OverviewPage)
    await harness.fixture.whenStable()

    const root = harness.routeNativeElement as HTMLElement

    execute.mockRejectedValueOnce(new Error('network down'))
    const reloadButton = Array.from(root.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Reload'),
    )
    reloadButton?.click()
    await harness.fixture.whenStable()

    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Could not load the dashboard.',
    )
    expect(root.textContent).toContain('Open reports')
    expect(root.querySelectorAll('ul > li').length).toBeGreaterThanOrEqual(9)
  })

  it('renders the activity charts once the series loads, with the range summary', async () => {
    execute.mockResolvedValue(overview())

    await harness.navigateByUrl('/', OverviewPage)
    await harness.fixture.whenStable()

    const root = harness.routeNativeElement as HTMLElement

    expect(executeSeries).toHaveBeenCalledWith(30)
    expect(root.querySelectorAll('app-line-chart, app-bar-chart').length).toBe(5)
    expect(root.textContent).toContain('30 days')
  })

  it('re-requests the series at the newly selected range when a range button is clicked', async () => {
    execute.mockResolvedValue(overview())

    await harness.navigateByUrl('/', OverviewPage)
    await harness.fixture.whenStable()

    const root = harness.routeNativeElement as HTMLElement
    const sevenDayButton = Array.from(root.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === '7d',
    )
    sevenDayButton?.click()
    await harness.fixture.whenStable()

    expect(executeSeries).toHaveBeenCalledWith(7)
    expect(TestBed.inject(Location).path()).toBe('/?days=7')
  })

  it('shows a failure message when the series load rejects, instead of throwing', async () => {
    execute.mockResolvedValue(overview())
    executeSeries.mockReset()
    executeSeries.mockRejectedValue(new Error('network down'))

    await harness.navigateByUrl('/', OverviewPage)
    await harness.fixture.whenStable()

    const root = harness.routeNativeElement as HTMLElement

    expect(root.textContent).toContain('Could not load the activity charts.')
  })
})
