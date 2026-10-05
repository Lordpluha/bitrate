import { provideLocationMocks } from '@angular/common/testing'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, type Routes } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { SessionStore } from '@application/session'
import type { Permission } from '@domain/access'
import {
  type ListReportsQuery,
  type ModerationReport,
  ModerationReportRepository,
  type ReportDetail,
} from '@domain/moderation'
import type { BatchResult, Page } from '@domain/shared'
import { TranslocoTestingModule } from '@jsverse/transloco'
import { DEFAULT_LOCALE, LOCALES } from '@presentation/navigation'
import { ExportRepository } from '@domain/export'
import { FileSaver } from '@presentation/components'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ModerationQueue } from './moderation'

const FIRST = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'
const SECOND = '3f2504e0-4f89-41d3-9a0c-0305e82c3302'

function report(overrides: Partial<ModerationReport> = {}): ModerationReport {
  return {
    id: FIRST,
    reporterId: '3f2504e0-4f89-41d3-9a0c-0305e82c3310',
    entityType: 'track',
    entityId: '3f2504e0-4f89-41d3-9a0c-0305e82c3320',
    reason: 'Copyright',
    details: null,
    status: 'OPEN',
    resolvedAt: null,
    createdAt: new Date('2026-09-14T12:00:00.000Z'),
    ...overrides,
  }
}

const list = vi.fn<(query: ListReportsQuery) => Promise<Page<ModerationReport>>>()
const resolveMany = vi.fn<(ids: readonly string[]) => Promise<BatchResult>>()
const dismissMany = vi.fn<(ids: readonly string[]) => Promise<BatchResult>>()

class StubReportRepository extends ModerationReportRepository {
  override list(query: ListReportsQuery): Promise<Page<ModerationReport>> {
    return list(query)
  }

  override getById(_id: string): Promise<ReportDetail> {
    throw new Error('not used')
  }

  override setStatus(): Promise<ModerationReport> {
    throw new Error('not used')
  }

  override resolveMany(ids: readonly string[]): Promise<BatchResult> {
    return resolveMany(ids)
  }

  override dismissMany(ids: readonly string[]): Promise<BatchResult> {
    return dismissMany(ids)
  }
}

const exportReports = vi.fn<ExportRepository['exportReports']>()

/** Only the export this page uses is exercised; the others fail loudly if reached. */
class StubExportRepository extends ExportRepository {
  override exportUsers(): ReturnType<ExportRepository['exportUsers']> {
    throw new Error('not used')
  }

  override exportArtists(): ReturnType<ExportRepository['exportArtists']> {
    throw new Error('not used')
  }

  override exportTracks(): ReturnType<ExportRepository['exportTracks']> {
    throw new Error('not used')
  }

  override exportReports(...args: Parameters<ExportRepository['exportReports']>) {
    return exportReports(...args)
  }
}

const routes: Routes = [{ path: 'moderation', component: ModerationQueue }]

describe('ModerationQueue — batch actions', () => {
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
    resolveMany.mockReset()
    dismissMany.mockReset()
    list.mockResolvedValue({
      items: [report({ id: FIRST }), report({ id: SECOND, reason: 'Spam' })],
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
        { provide: ModerationReportRepository, useClass: StubReportRepository },
        { provide: ExportRepository, useClass: StubExportRepository },
      ],
    })
    harness = await RouterTestingHarness.create()
  })

  it('offers no checkboxes to an operator without reports:advance', async () => {
    operator(['reports:read'])
    await harness.navigateByUrl('/moderation', ModerationQueue)
    await harness.fixture.whenStable()

    expect(host().querySelectorAll('input[type="checkbox"]')).toHaveLength(0)
    expect(bar()).toBeNull()
  })

  it('shows Resolve and Dismiss in the bar once rows are selected', async () => {
    operator(['reports:read', 'reports:advance'])
    await harness.navigateByUrl('/moderation', ModerationQueue)
    await harness.fixture.whenStable()

    host()
      .querySelector<HTMLInputElement>('input[aria-label="Select all reports on this page"]')
      ?.click()
    await harness.fixture.whenStable()

    expect(bar()?.textContent).toContain('2 reports selected')
    expect(button(bar(), 'Resolve')).toBeDefined()
    expect(button(bar(), 'Dismiss')).toBeDefined()
  })

  it('dismisses the selected reports after one confirm and summarises each row', async () => {
    operator(['reports:read', 'reports:advance'])
    dismissMany.mockResolvedValue({
      items: [
        { id: FIRST, outcome: 'succeeded' },
        { id: SECOND, outcome: 'failed', failure: { code: 'NOT_FOUND', message: 'Report gone' } },
      ],
      succeeded: 1,
      failed: 1,
    })
    await harness.navigateByUrl('/moderation', ModerationQueue)
    await harness.fixture.whenStable()
    host()
      .querySelector<HTMLInputElement>('input[aria-label="Select all reports on this page"]')
      ?.click()
    await harness.fixture.whenStable()

    button(bar(), 'Dismiss')?.click()
    await harness.fixture.whenStable()
    const confirm = dialog()
    expect(confirm?.querySelectorAll('li')).toHaveLength(2)
    expect(dismissMany).not.toHaveBeenCalled()

    button(confirm, 'Dismiss reports')?.click()
    await harness.fixture.whenStable()

    expect(dismissMany).toHaveBeenCalledWith([FIRST, SECOND])
    expect(resolveMany).not.toHaveBeenCalled()
    expect(dialog()?.textContent).toContain('1 succeeded, 1 failed')
    expect(dialog()?.textContent).toContain('Report gone')
  })
})

describe('ModerationQueue — CSV export', () => {
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
  const exportButton = () =>
    Array.from(
      (harness.routeNativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'),
    ).find((candidate) => candidate.textContent?.trim().startsWith('Export CSV'))

  beforeEach(async () => {
    list.mockReset()
    exportReports.mockReset()
    list.mockResolvedValue({ items: [report()], total: 1, page: 1, limit: 20 })
    exportReports.mockResolvedValue({
      blob: new Blob(['id\r\n']),
      filename: 'export.csv',
      truncated: false,
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
        { provide: ModerationReportRepository, useClass: StubReportRepository },
        { provide: ExportRepository, useClass: StubExportRepository },
        { provide: FileSaver, useValue: { save: vi.fn() } },
      ],
    })
    harness = await RouterTestingHarness.create()
  })

  it('offers no export to an operator without reports:export', async () => {
    operator(['reports:read'])
    await harness.navigateByUrl('/moderation', ModerationQueue)
    await harness.fixture.whenStable()

    expect(exportButton()).toBeUndefined()
  })

  it('offers the export to an operator with reports:export', async () => {
    operator(['reports:read', 'reports:export'])
    await harness.navigateByUrl('/moderation', ModerationQueue)
    await harness.fixture.whenStable()

    expect(exportButton()).toBeDefined()
  })

  it('exports the filters and sort in the URL, not the loaded page', async () => {
    operator(['reports:read', 'reports:export'])
    await harness.navigateByUrl('/moderation?sort=status&dir=asc&page=2', ModerationQueue)
    await harness.fixture.whenStable()

    exportButton()?.click()
    await harness.fixture.whenStable()

    expect(exportReports).toHaveBeenCalledTimes(1)
    expect(exportReports).toHaveBeenCalledWith(
      expect.objectContaining({ sort: { field: 'status', direction: 'asc' } }),
    )
  })
})
