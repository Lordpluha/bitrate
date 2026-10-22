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
import { createDetailResource } from '@presentation/state'
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

  private readonly record = createDetailResource({
    load: () => this.getReport.execute(this.reportId),
    errorMessage: 'Could not load this report.',
  })

  protected readonly report = this.record.value
  protected readonly loading = this.record.loading
  protected readonly notFound = this.record.notFound
  protected readonly failure = this.record.failure
  protected readonly pending = signal(false)

  constructor() {
    void this.record.reload()
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
      this.record.set({ ...current, ...updated })
    } catch {
      this.failure.set(`Could not move this report to ${status}.`)
    } finally {
      this.pending.set(false)
    }
  }
}
