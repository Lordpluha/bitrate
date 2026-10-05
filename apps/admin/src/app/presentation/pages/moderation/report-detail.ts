import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { AdvanceReportUseCase, GetReportUseCase } from '@application/moderation'
import { SessionStore } from '@application/session'
import {
  canAdvanceTo,
  type ModerationStatus,
  type ModerationSubject,
  type ReportDetail,
} from '@domain/moderation'
import { LocalizedDatePipe } from '@presentation/pipes'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'

const ADVANCE_TARGETS: readonly { status: ModerationStatus; label: string }[] = [
  { status: 'REVIEWING', label: 'Take' },
  { status: 'RESOLVED', label: 'Resolve' },
  { status: 'REJECTED', label: 'Reject' },
]

/**
 * Subject kinds with a panel detail page to link to. An episode has no page of its own, so it
 * links to its podcast's — and renders as plain text when the report carries no podcast id.
 * Albums have no link here yet.
 */
const SUBJECT_ROUTES: Readonly<
  Record<string, (subject: ModerationSubject) => readonly [string, string] | null>
> = {
  track: ({ id }) => ['/catalog', id],
  artist: ({ id }) => ['/artists', id],
  user: ({ id }) => ['/users', id],
  playlist: ({ id }) => ['/playlists', id],
  podcast: ({ id }) => ['/podcasts', id],
  episode: ({ parentId }) => (parentId ? ['/podcasts', parentId] : null),
}

@Component({
  selector: 'app-report-detail',
  imports: [LocalizedDatePipe, RouterLink, HlmBadgeImports, HlmButtonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './report-detail.html',
})
export class ReportDetailPage {
  private readonly route = inject(ActivatedRoute)
  private readonly getReport = inject(GetReportUseCase)
  private readonly advanceReport = inject(AdvanceReportUseCase)

  protected readonly canAdvance = inject(SessionStore).can('reports:advance')
  protected readonly targets = ADVANCE_TARGETS
  protected readonly reportId = this.route.snapshot.paramMap.get('id') ?? ''

  protected readonly report = signal<ReportDetail | null>(null)
  protected readonly loading = signal(true)
  protected readonly notFound = signal(false)
  protected readonly failure = signal<string | null>(null)
  protected readonly pending = signal(false)

  constructor() {
    void this.load()
  }

  protected advanceable(report: ReportDetail, status: ModerationStatus): boolean {
    return canAdvanceTo({ report, status })
  }

  protected subjectLink(subject: ModerationSubject): readonly [string, string] | null {
    return SUBJECT_ROUTES[subject.kind]?.(subject) ?? null
  }

  protected async advance(status: ModerationStatus): Promise<void> {
    const current = this.report()
    if (!current) return

    this.pending.set(true)
    this.failure.set(null)
    try {
      const updated = await this.advanceReport.execute({ report: current, status })
      this.report.set({ ...current, ...updated })
    } catch {
      this.failure.set(`Could not move this report to ${status}.`)
    } finally {
      this.pending.set(false)
    }
  }

  private async load(): Promise<void> {
    this.loading.set(true)
    try {
      this.report.set(await this.getReport.execute(this.reportId))
      this.notFound.set(false)
    } catch {
      this.notFound.set(true)
    } finally {
      this.loading.set(false)
    }
  }
}
