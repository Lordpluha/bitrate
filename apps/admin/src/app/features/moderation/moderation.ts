import { DatePipe } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { type ModerationReport, ModerationService, type ModerationStatus } from '@shared/api'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmTableImports } from '@spartan-ng/helm/table'

const STATUSES: readonly ModerationStatus[] = ['OPEN', 'REVIEWING', 'RESOLVED', 'REJECTED']

@Component({
  selector: 'app-moderation',
  imports: [DatePipe, HlmBadgeImports, HlmButtonImports, HlmTableImports],
  templateUrl: './moderation.html',
})
export class ModerationQueue {
  private readonly moderation = inject(ModerationService)

  protected readonly statuses = STATUSES
  protected readonly reports = signal<ModerationReport[]>([])
  protected readonly total = signal(0)
  protected readonly filter = signal<ModerationStatus | null>('OPEN')
  protected readonly loading = signal(false)
  protected readonly failure = signal<string | null>(null)

  constructor() {
    void this.load()
  }

  protected async setFilter(status: ModerationStatus | null): Promise<void> {
    this.filter.set(status)
    await this.load()
  }

  protected async advance(report: ModerationReport, status: ModerationStatus): Promise<void> {
    this.failure.set(null)
    try {
      await this.moderation.updateStatus({ id: report.id, status })
      await this.load()
    } catch {
      this.failure.set(`Could not move report ${report.id} to ${status}.`)
    }
  }

  private async load(): Promise<void> {
    this.loading.set(true)
    this.failure.set(null)
    try {
      const page = await this.moderation.list({ status: this.filter() ?? undefined })
      this.reports.set(page.data)
      this.total.set(page.total)
    } catch {
      this.failure.set('Could not load the moderation queue.')
      this.reports.set([])
    } finally {
      this.loading.set(false)
    }
  }
}
