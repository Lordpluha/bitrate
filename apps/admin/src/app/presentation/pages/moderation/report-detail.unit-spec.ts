import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { AdvanceReportUseCase, GetReportUseCase } from '@application/moderation'
import { SessionStore } from '@application/session'
import type { ReportDetail } from '@domain/moderation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ReportDetailPage } from './report-detail'
import { TranslocoTestingModule } from '@jsverse/transloco'
import { DEFAULT_LOCALE, LOCALES } from '@presentation/navigation'

const ADMIN_STAFF = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  email: 'ops@bitrate.me',
  username: 'ops',
  roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
  roleName: 'ADMIN',
  permissions: [],
}

function detail(overrides: Partial<ReportDetail> = {}): ReportDetail {
  return {
    id: '9f2504e0-4f89-41d3-9a0c-0305e82c3301',
    reporterId: '9f2504e0-4f89-41d3-9a0c-0305e82c3302',
    entityType: 'track',
    entityId: '9f2504e0-4f89-41d3-9a0c-0305e82c3303',
    reason: 'Copyright',
    details: null,
    status: 'OPEN',
    resolvedAt: null,
    createdAt: new Date('2026-09-14T12:00:00.000Z'),
    subject: {
      kind: 'track',
      id: '9f2504e0-4f89-41d3-9a0c-0305e82c3303',
      title: 'Night Drive',
      deletedAt: null,
      parentId: null,
    },
    siblingReports: [],
    ...overrides,
  }
}

const getReport = vi.fn<() => Promise<ReportDetail>>()
const advanceReport = vi.fn<() => Promise<ReportDetail>>()

function create(): void {
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
      provideRouter([]),
      { provide: GetReportUseCase, useValue: { execute: getReport } },
      { provide: AdvanceReportUseCase, useValue: { execute: advanceReport } },
    ],
  })
  TestBed.inject(SessionStore).set(ADMIN_STAFF)
}

describe('ReportDetailPage', () => {
  beforeEach(() => {
    getReport.mockReset()
    advanceReport.mockReset()
  })

  it('renders the report reason and a link to its resolved track subject', async () => {
    getReport.mockResolvedValue(detail())
    create()

    const fixture = TestBed.createComponent(ReportDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    expect(host.textContent).toContain('Copyright')
    const link = host.querySelector<HTMLAnchorElement>(
      'a[href="/catalog/9f2504e0-4f89-41d3-9a0c-0305e82c3303"]',
    )
    expect(link?.textContent).toContain('Night Drive')
  })

  it('links a playlist subject to its panel detail page', async () => {
    getReport.mockResolvedValue(
      detail({
        subject: {
          kind: 'playlist',
          id: 'p1',
          title: 'Spam Mix',
          deletedAt: null,
          parentId: null,
        },
      }),
    )
    create()

    const fixture = TestBed.createComponent(ReportDetailPage)
    await fixture.whenStable()

    const link = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>(
      'a[href="/playlists/p1"]',
    )
    expect(link?.textContent).toContain('Spam Mix')
  })

  it('links a podcast subject to its panel detail page', async () => {
    getReport.mockResolvedValue(
      detail({
        subject: {
          kind: 'podcast',
          id: 'pc1',
          title: 'Spam Cast',
          deletedAt: null,
          parentId: null,
        },
      }),
    )
    create()

    const fixture = TestBed.createComponent(ReportDetailPage)
    await fixture.whenStable()

    const link = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>(
      'a[href="/podcasts/pc1"]',
    )
    expect(link?.textContent).toContain('Spam Cast')
  })

  it('links an episode subject to its podcast, and leaves it plain text without one', async () => {
    getReport.mockResolvedValue(
      detail({
        subject: { kind: 'episode', id: 'e1', title: 'Spam Ep', deletedAt: null, parentId: 'pc1' },
      }),
    )
    create()

    const linked = TestBed.createComponent(ReportDetailPage)
    await linked.whenStable()
    expect(
      (linked.nativeElement as HTMLElement).querySelector('a[href="/podcasts/pc1"]')?.textContent,
    ).toContain('Spam Ep')

    getReport.mockResolvedValue(
      detail({
        subject: { kind: 'episode', id: 'e1', title: 'Spam Ep', deletedAt: null, parentId: null },
      }),
    )
    create()
    const plain = TestBed.createComponent(ReportDetailPage)
    await plain.whenStable()
    const host = plain.nativeElement as HTMLElement
    expect(host.textContent).toContain('Spam Ep')
    expect(host.querySelector('a[href^="/podcasts"]')).toBeNull()
  })

  it('renders a plain-text subject for a kind without a panel page', async () => {
    getReport.mockResolvedValue(
      detail({
        subject: { kind: 'album', id: 'a1', title: 'Some Album', deletedAt: null, parentId: null },
      }),
    )
    create()

    const fixture = TestBed.createComponent(ReportDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    expect(host.textContent).toContain('Some Album')
    expect(host.querySelector('a[href*="a1"]')).toBeNull()
  })

  it('shows "Subject no longer exists" for a null subject', async () => {
    getReport.mockResolvedValue(detail({ subject: null }))
    create()

    const fixture = TestBed.createComponent(ReportDetailPage)
    await fixture.whenStable()

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Subject no longer exists')
  })

  it('shows the not-found message when the load rejects', async () => {
    getReport.mockRejectedValue(new Error('404'))
    create()

    const fixture = TestBed.createComponent(ReportDetailPage)
    await fixture.whenStable()

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent,
    ).toContain('could not be found')
  })

  it('advances the report and updates the displayed status', async () => {
    getReport.mockResolvedValue(detail())
    advanceReport.mockResolvedValue(detail({ status: 'REVIEWING' }))
    create()

    const fixture = TestBed.createComponent(ReportDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    Array.from(host.querySelectorAll('button'))
      .find((b) => b.textContent?.trim() === 'Take')
      ?.click()
    await fixture.whenStable()

    expect(advanceReport).toHaveBeenCalledWith(expect.objectContaining({ status: 'REVIEWING' }))
    expect(host.textContent).toContain('REVIEWING')
  })
})
