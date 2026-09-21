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
  signupsChartHeadline,
  signupsChartSeries,
  uploadsChartDescription,
  uploadsChartHeadline,
  uploadsChartSeries,
} from './overview-series.adapter'
import {
  buildAccountDeactivationStatus,
  buildReportsStatus,
  buildTrackPipelineStatus,
} from './overview-status'
import { OverviewStatusStrip } from './overview-status-strip'
import { overviewQueryCodec } from './overview.query'

/** The operator landing dashboard: daily-activity charts, each carrying the counts that belong to it. */
@Component({
  selector: 'app-overview',
  imports: [CollectionStatus, OverviewStatusStrip, BarChart, LineChart, HlmButtonImports],
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

  protected readonly trackPipelineStatus = computed(() => {
    const current = this.overview()
    return current ? buildTrackPipelineStatus(current) : []
  })

  protected readonly reportsStatus = computed(() => {
    const current = this.overview()
    return current ? buildReportsStatus(current) : []
  })

  protected readonly accountDeactivationStatus = computed(() => {
    const current = this.overview()
    return current ? buildAccountDeactivationStatus(current) : []
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
  /**
   * `null` whenever the series isn't cleanly loaded — while it's loading, after a failed
   * request, or (the fallback series) before the first request resolves — never a stale value
   * from a previous range or a `0` standing in for "unknown".
   */
  protected readonly signupsHeadline = computed(() =>
    this.seriesLoading() || this.seriesFailure() ? null : signupsChartHeadline(this.currentSeries()),
  )
  protected readonly uploadsHeadline = computed(() =>
    this.seriesLoading() || this.seriesFailure() ? null : uploadsChartHeadline(this.currentSeries()),
  )

  /** Shown in a chart card's own plot area when its series request failed — the header,
   *  description and any status strip stay visible regardless; see `BarChart`/`LineChart`'s
   *  `loading`/`failure` inputs. */
  protected readonly chartFailure = computed(() =>
    this.seriesFailure() ? 'Could not load this chart.' : null,
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
