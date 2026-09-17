import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { GetOverviewUseCase } from '@application/overview'
import { SessionStore } from '@application/session'
import type { Overview } from '@domain/overview'
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

const execute = vi.fn<() => Promise<Overview>>()

function create(): void {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideRouter([]),
      { provide: GetOverviewUseCase, useValue: { execute } },
    ],
  })
  /** ADMIN sees every guarded tile by identity — see `hasPermission`. */
  TestBed.inject(SessionStore).set(ADMIN_STAFF)
}

describe('OverviewPage', () => {
  beforeEach(() => {
    execute.mockReset()
  })

  it('renders every tile in a list, with a link where the target list can filter for it', async () => {
    execute.mockResolvedValue(overview())
    create()

    const fixture = TestBed.createComponent(OverviewPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement

    expect(host.querySelectorAll('ul > li').length).toBeGreaterThanOrEqual(9)
    expect(host.textContent).toContain('Open reports')
    expect(host.textContent).toContain('Failed tracks')
    expect(host.textContent).toContain('Stuck tracks')

    const openReportsLink = Array.from(host.querySelectorAll('a')).find((a) =>
      a.textContent?.includes('Open reports'),
    )
    /** `OPEN` is the moderation codec's own default, so the canonical link carries no query params. */
    expect(openReportsLink?.getAttribute('href')).toBe('/moderation')
  })

  it('gives the tile grid an accessible heading, and keeps h1 -> h2 order', async () => {
    execute.mockResolvedValue(overview())
    create()

    const fixture = TestBed.createComponent(OverviewPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    const h1 = host.querySelector('h1')
    const headings = Array.from(host.querySelectorAll('h1, h2, h3'))

    expect(h1?.textContent).toContain('Overview')
    expect(headings.map((heading) => heading.tagName)).toEqual(['H1', 'H2', 'H2'])

    const grid = host.querySelector('ul[aria-labelledby="dashboard-summary-heading"]')
    expect(grid).not.toBeNull()
    expect(document.getElementById('dashboard-summary-heading')).not.toBeNull()
  })

  it('renders the stuck-tracks tile without a link — the catalog has no stuck filter', async () => {
    execute.mockResolvedValue(overview())
    create()

    const fixture = TestBed.createComponent(OverviewPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    const stuckTileLink = Array.from(host.querySelectorAll('a')).find((a) =>
      a.textContent?.includes('Stuck tracks'),
    )

    expect(stuckTileLink).toBeUndefined()
  })

  it('shows a failure message when the load rejects, instead of throwing', async () => {
    execute.mockRejectedValue(new Error('network down'))
    create()

    const fixture = TestBed.createComponent(OverviewPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement

    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      'Could not load the dashboard.',
    )
  })

  it('keeps the previously loaded tiles on screen when a reload fails, alongside the alert', async () => {
    execute.mockResolvedValueOnce(overview())
    create()

    const fixture = TestBed.createComponent(OverviewPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement

    execute.mockRejectedValueOnce(new Error('network down'))
    const reloadButton = Array.from(host.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Reload'),
    )
    reloadButton?.click()
    await fixture.whenStable()

    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      'Could not load the dashboard.',
    )
    expect(host.textContent).toContain('Open reports')
    expect(host.querySelectorAll('ul > li').length).toBeGreaterThanOrEqual(9)
  })

  it('shows the empty-activity message when recentActivity is empty', async () => {
    execute.mockResolvedValue(overview({ recentActivity: [] }))
    create()

    const fixture = TestBed.createComponent(OverviewPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement

    expect(host.textContent).toContain('No recent operator actions.')
  })
})
