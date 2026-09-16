import { DatePipe } from '@angular/common'
import { Component, effect, inject, signal } from '@angular/core'
import { AdvanceReportUseCase, ListReportsUseCase } from '@application/moderation'
import { type ModerationReport, type ModerationStatus } from '@domain/moderation'
import { CollectionStatus, Paginator } from '@presentation/components'
import { bindQueryState, createCollection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { MODERATION_STATUSES, moderationQueryCodec } from './moderation.query'

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

  protected readonly statuses = MODERATION_STATUSES
  protected readonly query = bindQueryState({ codec: moderationQueryCodec })
  protected readonly busyId = signal<string | null>(null)

  protected readonly collection = createCollection<ModerationReport>({
    errorMessage: 'Could not load the moderation queue.',
    load: (page) =>
      this.listReports.execute({
        page,
        filter: { status: this.query.state().status ?? undefined },
      }),
  })

  constructor() {
    effect(() => {
      const { page } = this.query.state()
      void this.collection.show(page)
    })
  }

  protected setFilter(status: ModerationStatus | null): void {
    this.query.patch({ status, page: 1 })
  }

  protected goToPage(page: number): void {
    this.query.patch({ page })
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
