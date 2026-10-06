import { Location } from '@angular/common'
import { provideLocationMocks } from '@angular/common/testing'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, type Routes } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { GetOverviewReportsByTypeUseCase } from '@application/overview'
import { SessionStore } from '@application/session'
import type { OverviewReportsByType } from '@domain/overview'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OverviewReportsPage } from './overview-reports'

const ADMIN_STAFF = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  email: 'ops@bitrate.me',
  username: 'ops',
  roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
  roleName: 'ADMIN',
  permissions: [],
}

function reportsByType(overrides: Partial<OverviewReportsByType> = {}): OverviewReportsByType {
  return {
    from: new Date('2026-09-16T00:00:00.000Z'),
    to: new Date('2026-09-17T00:00:00.000Z'),
    days: 30,
    dates: [new Date('2026-09-16T00:00:00.000Z'), new Date('2026-09-17T00:00:00.000Z')],
    series: [
      { entityType: 'track', counts: [1, 2], total: 3 },
      { entityType: 'user', counts: [0, 4], total: 4 },
    ],
    total: 7,
    ...overrides,
  }
}

const execute = vi.fn<(days: number) => Promise<OverviewReportsByType>>()

const routes: Routes = [{ path: 'overview/reports', component: OverviewReportsPage }]

describe('OverviewReportsPage', () => {
  let harness: RouterTestingHarness

  beforeEach(async () => {
    execute.mockReset()
    execute.mockResolvedValue(reportsByType())

    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideLocationMocks(),
        { provide: GetOverviewReportsByTypeUseCase, useValue: { execute } },
      ],
    })
    TestBed.inject(SessionStore).set(ADMIN_STAFF)
    harness = await RouterTestingHarness.create()
  })

  it('loads at the default 30-day range and renders the stacked chart with a headline', async () => {
    await harness.navigateByUrl('/overview/reports', OverviewReportsPage)
    await harness.fixture.whenStable()

    const root = harness.routeNativeElement as HTMLElement

    expect(execute).toHaveBeenCalledWith(30)
    expect(root.querySelectorAll('app-bar-chart').length).toBe(1)
    expect(root.textContent).toContain('Reports filed, 30d')
  })

  it('reads the range from the URL', async () => {
    await harness.navigateByUrl('/overview/reports?days=90', OverviewReportsPage)
    await harness.fixture.whenStable()

    expect(execute).toHaveBeenCalledWith(90)
  })

  it('re-requests at the newly selected range and writes it to the URL', async () => {
    await harness.navigateByUrl('/overview/reports', OverviewReportsPage)
    await harness.fixture.whenStable()

    const root = harness.routeNativeElement as HTMLElement
    Array.from(root.querySelectorAll('button'))
      .find((button) => button.textContent?.trim() === '7d')
      ?.click()
    await harness.fixture.whenStable()

    expect(execute).toHaveBeenCalledWith(7)
    expect(TestBed.inject(Location).path()).toBe('/overview/reports?days=7')
  })

  it('links each entity type to the moderation queue filtered by it', async () => {
    await harness.navigateByUrl('/overview/reports', OverviewReportsPage)
    await harness.fixture.whenStable()

    const root = harness.routeNativeElement as HTMLElement
    const hrefs = Array.from(root.querySelectorAll('a')).map((a) => a.getAttribute('href'))

    expect(hrefs).toContain('/moderation?entityType=track&status=all')
    expect(hrefs).toContain('/moderation?entityType=user&status=all')
  })

  it('links back to the overview, preserving the range', async () => {
    await harness.navigateByUrl('/overview/reports?days=7', OverviewReportsPage)
    await harness.fixture.whenStable()

    const root = harness.routeNativeElement as HTMLElement
    const back = Array.from(root.querySelectorAll('a')).find((a) =>
      a.textContent?.includes('Back to overview'),
    )

    expect(back?.getAttribute('href')).toBe('/?days=7')
  })

  it('shows a failure message and no headline when the request rejects', async () => {
    execute.mockReset()
    execute.mockRejectedValue(new Error('network down'))

    await harness.navigateByUrl('/overview/reports', OverviewReportsPage)
    await harness.fixture.whenStable()

    const root = harness.routeNativeElement as HTMLElement

    expect(root.textContent).toContain('Could not load reports by entity type.')
    expect(root.textContent).not.toContain('Reports filed, ')
  })
})
