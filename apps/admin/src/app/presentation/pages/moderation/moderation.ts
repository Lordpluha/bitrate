import { DatePipe } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { AdvanceReportUseCase, ListReportsUseCase } from '@application/moderation'
import { type ModerationReport, type ModerationStatus } from '@domain/moderation'
import { coveringTuple } from '@domain/shared'
import { CollectionStatus, Paginator } from '@presentation/components'
import { createCollection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmTableImports } from '@spartan-ng/helm/table'

/** Every status is filterable, and `coveringTuple` is what keeps that true as the union grows. */
const FILTERS = coveringTuple<ModerationStatus>()(['OPEN', 'REVIEWING', 'RESOLVED', 'REJECTED'])

@Component({
  selector: 'app-moderation',
  imports: [
    DatePipe,
    CollectionStatus,
    Paginator,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
  ],
  templateUrl: './moderation.html',
})
export class ModerationQueue {
  private readonly listReports = inject(ListReportsUseCase)
  private readonly advanceReport = inject(AdvanceReportUseCase)

  protected readonly statuses = FILTERS
  /** Opens first: the queue exists to be emptied, not browsed. */
  protected readonly filter = signal<ModerationStatus | null>('OPEN')
  protected readonly busyId = signal<string | null>(null)

  protected readonly collection = createCollection<ModerationReport>({
    errorMessage: 'Could not load the moderation queue.',
    load: (page) =>
      this.listReports.execute({ page, filter: { status: this.filter() ?? undefined } }),
  })

  constructor() {
    void this.collection.restart()
  }

  protected async setFilter(status: ModerationStatus | null): Promise<void> {
    this.filter.set(status)
    await this.collection.restart()
  }

  protected async advance(report: ModerationReport, status: ModerationStatus): Promise<void> {
    this.busyId.set(report.id)
    try {
      await this.advanceReport.execute({ report, status })
      await this.collection.reload()
    } catch {
      this.collection.fail(`Could not move that report to ${status}.`)
    } finally {
      this.busyId.set(null)
    }
  }
}
