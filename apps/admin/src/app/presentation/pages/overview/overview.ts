import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core'
import { GetOverviewSeriesUseCase, GetOverviewUseCase } from '@application/overview'
import {
  OVERVIEW_SERIES_RANGE_DAYS,
  type Overview,
  type OverviewSeries,
  type OverviewSeriesRangeDays,
} from '@domain/overview'
import { BarChart, CollectionStatus, LineChart } from '@presentation/components'
import { bindQueryState } from '@presentation/state'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import {
  listensChartDescription,
  listensChartSeries,
  rangeSummary,
  reportsByStatusChartDescription,
  reportsByStatusChartSeries,
  reportsChartDescription,
  reportsChartSeries,
  REPORT_STATUS_CATEGORIES,
  seriesCategories,
  signupsChartDescription,
  signupsChartSeries,
  uploadsChartDescription,
  uploadsChartSeries,
} from './overview-series.adapter'
import { overviewQueryCodec } from './overview.query'
import { OverviewTileCard } from './overview-tile'
import { buildOverviewTiles } from './overview-tiles'

/** The operator landing dashboard: aggregate counts, then daily-activity charts. */
@Component({
  selector: 'app-overview',
  imports: [CollectionStatus, OverviewTileCard, BarChart, LineChart, HlmButtonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './overview.html',
})
export class OverviewPage {
  private readonly getOverview = inject(GetOverviewUseCase)
  private readonly getOverviewSeries = inject(GetOverviewSeriesUseCase)

  protected readonly rangeOptions = OVERVIEW_SERIES_RANGE_DAYS
  protected readonly range = bindQueryState({ codec: overviewQueryCodec })

  protected readonly overview = signal<Overview | null>(null)
  protected readonly loading = signal(true)
  protected readonly failure = signal<string | null>(null)

  protected readonly series = signal<OverviewSeries | null>(null)
  protected readonly seriesLoading = signal(true)
  protected readonly seriesFailure = signal<string | null>(null)

  protected readonly tiles = computed(() => {
    const current = this.overview()
    return current ? buildOverviewTiles(current) : []
  })

  protected readonly categories = computed(() => {
    const current = this.series()
    return current ? seriesCategories(current) : []
  })

  protected readonly summary = computed(() => {
    const current = this.series()
    return current ? rangeSummary(current) : ''
  })

  private readonly currentSeries = computed(() => this.series() ?? emptySeries())
  protected readonly uploadsSeries = computed(() => uploadsChartSeries(this.currentSeries()))
  protected readonly signupsSeries = computed(() => signupsChartSeries(this.currentSeries()))
  protected readonly listensSeries = computed(() => listensChartSeries(this.currentSeries()))
  protected readonly reportsSeries = computed(() => reportsChartSeries(this.currentSeries()))
  protected readonly reportsByStatusSeries = computed(() =>
    reportsByStatusChartSeries(this.currentSeries()),
  )
  protected readonly reportStatusCategories = REPORT_STATUS_CATEGORIES

  protected readonly signupsDescription = computed(() =>
    signupsChartDescription(this.currentSeries()),
  )
  protected readonly listensDescription = computed(() =>
    listensChartDescription(this.currentSeries()),
  )
  protected readonly uploadsDescription = computed(() =>
    uploadsChartDescription(this.currentSeries()),
  )
  protected readonly reportsDescription = computed(() =>
    reportsChartDescription(this.currentSeries()),
  )
  protected readonly reportsByStatusDescription = reportsByStatusChartDescription()

  constructor() {
    void this.load()

    effect(() => {
      const { days } = this.range.state()
      void this.loadSeries(days)
    })
  }

  protected async load(): Promise<void> {
    this.loading.set(true)
    this.failure.set(null)
    try {
      this.overview.set(await this.getOverview.execute())
    } catch {
      this.failure.set('Could not load the dashboard.')
    } finally {
      this.loading.set(false)
    }
  }

  protected reload(): void {
    void this.load()
    void this.loadSeries(this.range.state().days)
  }

  protected setRange(days: OverviewSeriesRangeDays): void {
    this.range.patch({ days })
  }

  private async loadSeries(days: OverviewSeriesRangeDays): Promise<void> {
    this.seriesLoading.set(true)
    this.seriesFailure.set(null)
    try {
      this.series.set(await this.getOverviewSeries.execute(days))
    } catch {
      this.seriesFailure.set('Could not load the activity charts.')
    } finally {
      this.seriesLoading.set(false)
    }
  }
}

/** The chart adapters only read arrays, so an empty series is a safe fallback while loading. */
function emptySeries(): OverviewSeries {
  return {
    from: new Date(0),
    to: new Date(0),
    days: 0,
    uploads: [],
    signups: [],
    listens: [],
    reports: [],
    reportsByStatus: { open: 0, reviewing: 0, resolved: 0, rejected: 0 },
  }
}
