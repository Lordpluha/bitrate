import { inject, Injectable } from '@angular/core'
import {
  type ModerationFilter,
  type ModerationReport,
  ModerationReportRepository,
} from '@domain/moderation'
import { DEFAULT_PAGE_SIZE, type Page } from '@domain/shared'

export type ListReportsInput = {
  page: number
  filter?: ModerationFilter
}

@Injectable({ providedIn: 'root' })
export class ListReportsUseCase {
  private readonly reports = inject(ModerationReportRepository)

  execute({ page, filter = {} }: ListReportsInput): Promise<Page<ModerationReport>> {
    return this.reports.list({ page, limit: DEFAULT_PAGE_SIZE, filter })
  }
}
