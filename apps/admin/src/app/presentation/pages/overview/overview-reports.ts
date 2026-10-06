import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { GetOverviewReportsByTypeUseCase } from '@application/overview'
import {
  OVERVIEW_SERIES_RANGE_DAYS,
  type OverviewReportsByType,
  type OverviewSeriesRangeDays,
} from '@domain/overview'
import { BarChart, CollectionStatus } from '@presentation/components'
import { bindQueryState } from '@presentation/state'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import {
  reportsByTypeCategories,
  reportsByTypeChartSeries,
  reportsByTypeDescription,
  reportsByTypeHeadline,
} from './overview-reports.adapter'
import { buildReportsByTypeStatus } from './overview-status'
import { OverviewStatusStrip } from './overview-status-strip'
import { overviewQueryCodec } from './overview.query'

/**
 * The drill-down behind the Overview's open-reports tile: moderation reports filed per day,
 * stacked by the kind of entity reported. Shares the Overview's `?days=` range state.
 */
@Component({
  selector: 'app-overview-reports',
  imports: [BarChart, CollectionStatus, OverviewStatusStrip, RouterLink, HlmButtonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './overview-reports.html',
})
export class OverviewReportsPage {
  private readonly getReportsByType = inject(GetOverviewReportsByTypeUseCase)

  protected readonly rangeOptions = OVERVIEW_SERIES_RANGE_DAYS
  protected readonly range = bindQueryState({ codec: overviewQueryCodec })

  protected readonly data = signal<OverviewReportsByType | null>(null)
  protected readonly loading = signal(true)
  protected readonly failure = signal<string | null>(null)

  private readonly current = computed(() => this.data() ?? emptyData())
  protected readonly categories = computed(() => reportsByTypeCategories(this.current()))
  protected readonly series = computed(() => reportsByTypeChartSeries(this.current()))
  protected readonly description = computed(() => reportsByTypeDescription(this.current()))
  protected readonly typeTotals = computed(() => buildReportsByTypeStatus(this.current()))
  /** `null` while loading or after a failure — never a stale or placeholder `0`. */
  protected readonly headline = computed(() =>
    this.loading() || this.failure() ? null : reportsByTypeHeadline(this.current()),
  )
  protected readonly chartFailure = computed(() =>
    this.failure() ? 'Could not load this chart.' : null,
  )

  constructor() {
    effect(() => {
      const { days } = this.range.state()
      void this.load(days)
    })
  }

  protected reload(): void {
    void this.load(this.range.state().days)
  }

  protected setRange(days: OverviewSeriesRangeDays): void {
    this.range.patch({ days })
  }

  private async load(days: OverviewSeriesRangeDays): Promise<void> {
    this.loading.set(true)
    this.failure.set(null)
    try {
      this.data.set(await this.getReportsByType.execute(days))
    } catch {
      this.failure.set('Could not load reports by entity type.')
    } finally {
      this.loading.set(false)
    }
  }
}

/** The chart adapters only read arrays, so an empty value is a safe fallback while loading. */
function emptyData(): OverviewReportsByType {
  return { from: new Date(0), to: new Date(0), days: 0, dates: [], series: [], total: 0 }
}
