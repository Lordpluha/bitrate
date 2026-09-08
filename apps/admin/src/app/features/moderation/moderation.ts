import { DatePipe } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { type ModerationReport, ModerationService, type ModerationStatus } from '@shared/api'
import { CollectionStatus, Paginator } from '@shared/components'
import { createCollection } from '@shared/lib/collection'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmTableImports } from '@spartan-ng/helm/table'

const STATUSES: readonly ModerationStatus[] = ['OPEN', 'REVIEWING', 'RESOLVED', 'REJECTED']

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
  private readonly moderation = inject(ModerationService)

  protected readonly statuses = STATUSES
  /** Opens first: the queue exists to be emptied, not browsed. */
  protected readonly filter = signal<ModerationStatus | null>('OPEN')
  protected readonly busyId = signal<string | null>(null)

  protected readonly collection = createCollection<ModerationReport>({
    errorMessage: 'Could not load the moderation queue.',
    load: (page) => this.moderation.list({ page, status: this.filter() ?? undefined }),
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
      await this.moderation.updateStatus({ id: report.id, status })
      await this.collection.reload()
    } catch {
      this.collection.fail(`Could not move that report to ${status}.`)
    } finally {
      this.busyId.set(null)
    }
  }
}
