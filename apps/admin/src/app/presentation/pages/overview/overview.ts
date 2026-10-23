import { NgTemplateOutlet } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { type ArtistStats, GetArtistStatsUseCase } from '@application/artists'
import { ListReportsUseCase } from '@application/moderation'
import {
  GetOverviewReportsByTypeUseCase,
  GetOverviewSeriesUseCase,
  GetOverviewUseCase,
} from '@application/overview'
import { GetReleaseQueueStatsUseCase, type ReleaseQueueStats } from '@application/release-review'
import { SessionStore } from '@application/session'
import type { ResourceCounts } from '@application/shared'
import { GetUserStatsUseCase } from '@application/users'
import type { ModerationReport } from '@domain/moderation'
import {
  OVERVIEW_SERIES_RANGE_DAYS,
  type Overview,
  type OverviewReportsByType,
  type OverviewSeries,
  type OverviewSeriesRangeDays,
} from '@domain/overview'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import {
  lucideArrowUpRight,
  lucideAudioLines,
  lucideChevronRight,
  lucideCircleAlert,
  lucideDisc3,
  lucideFlag,
  lucideInbox,
  lucideLock,
  lucideMic,
  lucideScrollText,
  lucideUserPlus,
  lucideUsers,
  lucideX,
} from '@ng-icons/lucide'
import {
  LineChart,
  PageHeader,
  Skeleton,
  StateMessage,
  Tile,
  TileGrid,
} from '@presentation/components'
import { LocaleStore } from '@presentation/navigation'
import { ElapsedPipe } from '@presentation/pipes'
import { bindQueryState } from '@presentation/state'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { dayLabels, ENTITY_TYPE_COLOR, listensSeries, sum, type Translate } from './overview-charts'
import { buildPanel } from './overview-panel.model'
import { OverviewPanelView } from './overview-panel'
import { type OverviewPanel, overviewQueryCodec } from './overview.query'

/** A loaded optional source, or why it is missing — the tile shows a lock rather than a zero. */
type Optional<T> =
  { state: 'locked' } | { state: 'loading' } | { state: 'failed' } | { state: 'ok'; value: T }

const LOCKED = { state: 'locked' } as const

/**
 * The operator landing page: a bento of what needs action and how the platform is doing, each
 * tile opening an analysis panel. Every figure comes from the admin API; a source the operator's
 * role cannot read shows a locked tile instead of a guess.
 */
@Component({
  selector: 'app-overview',
  imports: [
    ElapsedPipe,
    HlmButtonImports,
    LineChart,
    NgIcon,
    NgTemplateOutlet,
    OverviewPanelView,
    PageHeader,
    RouterLink,
    Skeleton,
    StateMessage,
    Tile,
    TileGrid,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideArrowUpRight,
      lucideAudioLines,
      lucideChevronRight,
      lucideCircleAlert,
      lucideDisc3,
      lucideFlag,
      lucideInbox,
      lucideLock,
      lucideMic,
      lucideScrollText,
      lucideUserPlus,
      lucideUsers,
      lucideX,
    }),
  ],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './overview.html',
})
/**
 * Over 100 lines: the page owns several independent requests (overview, series, reports by type
 * and four role-gated counts) and the derived figures every tile reads; splitting them across
 * services would only move the same orchestration behind more injections.
 */
export class OverviewPage {
  private readonly getOverview = inject(GetOverviewUseCase)
  private readonly getSeries = inject(GetOverviewSeriesUseCase)
  private readonly getReportsByType = inject(GetOverviewReportsByTypeUseCase)
  private readonly getUserStats = inject(GetUserStatsUseCase)
  private readonly getArtistStats = inject(GetArtistStatsUseCase)
  private readonly getReleaseStats = inject(GetReleaseQueueStatsUseCase)
  private readonly listReports = inject(ListReportsUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly session = inject(SessionStore)
  protected readonly locale = inject(LocaleStore).locale

  protected readonly canReports = this.session.can('reports:read')
  protected readonly canReleases = this.session.can('releases:read')
  protected readonly canTracks = this.session.can('tracks:read')
  protected readonly canUsers = this.session.can('users:read')
  protected readonly canArtists = this.session.can('artists:read')
  protected readonly canAudit = this.session.can('audit:read')

  protected readonly rangeOptions = OVERVIEW_SERIES_RANGE_DAYS
  protected readonly query = bindQueryState({ codec: overviewQueryCodec })

  protected readonly overview = signal<Overview | null>(null)
  protected readonly loading = signal(true)
  protected readonly failed = signal(false)

  protected readonly series = signal<OverviewSeries | null>(null)
  protected readonly seriesLoading = signal(true)
  protected readonly seriesFailed = signal(false)
  protected readonly reportsByType = signal<OverviewReportsByType | null>(null)

  protected readonly users = signal<Optional<ResourceCounts>>(LOCKED)
  protected readonly artists = signal<Optional<ArtistStats>>(LOCKED)
  protected readonly releases = signal<Optional<ReleaseQueueStats>>(LOCKED)
  protected readonly latestReports = signal<ModerationReport[]>([])

  protected readonly t: Translate = (key, params = {}) =>
    this.transloco.translate(key, params, this.locale())

  protected readonly today = computed(() =>
    new Date().toLocaleDateString(this.locale(), {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }),
  )
  protected readonly days = computed(() => this.query.state().days)

  protected readonly categories = computed(() => {
    const current = this.series()
    return current
      ? dayLabels(
          current.listens.map((point) => point.date),
          this.locale(),
        )
      : []
  })
  protected readonly listens = computed(() => {
    this.locale()
    const current = this.series()
    return current ? listensSeries(current, this.t) : []
  })
  protected readonly totals = computed(() => {
    const current = this.series()
    if (!current) return null
    return {
      listens: sum(current.listens.map((point) => point.count)),
      newListeners: sum(current.signups.map((point) => point.listeners)),
      newArtists: sum(current.signups.map((point) => point.artists)),
      uploads: sum(current.uploads.map((point) => point.uploaded)),
    }
  })

  /** Reports, releases and tracks waiting on an operator — only the queues this role can see. */
  protected readonly needsAction = computed(() => {
    const current = this.overview()
    if (!current) return null
    const releases = this.releases()
    const reports = this.canReports() ? current.reports.open + current.reports.reviewing : 0
    const awaiting = releases.state === 'ok' ? releases.value.awaiting : 0
    const tracks = this.canTracks() ? current.tracks.failed + current.tracks.stuck : 0
    return { reports, awaiting, tracks, total: reports + awaiting + tracks }
  })

  /** The pipeline bar: each state's share of the tracks counted right now. */
  protected readonly pipeline = computed(() => {
    const current = this.overview()
    if (!current) return null
    const { ready, processing, stuck, failed } = current.tracks
    const total = ready + processing + stuck + failed
    const share = (value: number): number => (total === 0 ? 0 : (value / total) * 100)
    return {
      total,
      parts: [
        { key: 'ready', value: ready, share: share(ready), color: 'var(--color-success)' },
        {
          key: 'processing',
          value: processing,
          share: share(processing),
          color: 'var(--color-info)',
        },
        { key: 'stuck', value: stuck, share: share(stuck), color: 'var(--color-warning)' },
        { key: 'failed', value: failed, share: share(failed), color: 'var(--color-error)' },
      ],
    }
  })

  /** Reports filed in the range per entity type, largest first, as meter rows. */
  protected readonly reportTypes = computed(() => {
    const data = this.reportsByType()
    if (!data) return null
    const rows = data.series
      .map((entry) => ({
        type: entry.entityType,
        total: entry.total,
        color: `var(${ENTITY_TYPE_COLOR[entry.entityType]})`,
      }))
      .filter((row) => row.total > 0)
      .sort((a, b) => b.total - a.total)
    const max = rows[0]?.total ?? 0
    return {
      total: data.total,
      rows: rows.map((row) => ({ ...row, width: max === 0 ? 0 : (row.total / max) * 100 })),
    }
  })

  protected readonly listenersSpark = computed(() =>
    sparkPath(this.series()?.signups.map((point) => point.listeners) ?? []),
  )
  protected readonly artistsSpark = computed(() =>
    sparkPath(this.series()?.signups.map((point) => point.artists) ?? []),
  )

  protected readonly panel = computed(() => {
    const key = this.query.state().panel
    this.locale()
    if (key === null) return null
    return buildPanel(key, {
      t: this.t,
      locale: this.locale(),
      overview: this.overview(),
      series: this.series(),
      reportsByType: this.reportsByType(),
      users: okValue(this.users()),
      artists: okValue(this.artists()),
      releases: okValue(this.releases()),
      can: {
        reports: this.canReports(),
        releases: this.canReleases(),
        tracks: this.canTracks(),
        users: this.canUsers(),
        artists: this.canArtists(),
        audit: this.canAudit(),
      },
    })
  })

  constructor() {
    void this.load()
    effect(() => {
      const { days } = this.query.state()
      void this.loadRange(days)
    })
  }

  protected setRange(days: OverviewSeriesRangeDays): void {
    this.query.patch({ days })
  }

  protected openPanel(panel: OverviewPanel): void {
    this.query.patch({ panel })
  }

  protected closePanel(): void {
    this.query.patch({ panel: null })
  }

  protected reload(): void {
    void this.load()
    void this.loadRange(this.query.state().days)
  }

  protected reloadRange(): void {
    void this.loadRange(this.query.state().days)
  }

  private async load(): Promise<void> {
    this.loading.set(true)
    this.failed.set(false)
    const overview = this.getOverview
      .execute()
      .then((value) => this.overview.set(value))
      .catch(() => this.failed.set(true))
      .finally(() => this.loading.set(false))

    await Promise.all([
      overview,
      this.optional(this.canUsers(), this.users, () => this.getUserStats.execute()),
      this.optional(this.canArtists(), this.artists, () => this.getArtistStats.execute()),
      this.optional(this.canReleases(), this.releases, () => this.getReleaseStats.execute()),
      this.loadLatestReports(),
    ])
  }

  private async loadRange(days: OverviewSeriesRangeDays): Promise<void> {
    this.seriesLoading.set(true)
    this.seriesFailed.set(false)
    try {
      const [series, byType] = await Promise.all([
        this.getSeries.execute(days),
        this.getReportsByType.execute(days),
      ])
      this.series.set(series)
      this.reportsByType.set(byType)
    } catch {
      this.seriesFailed.set(true)
    } finally {
      this.seriesLoading.set(false)
    }
  }

  private async optional<T>(
    allowed: boolean,
    target: { set(value: Optional<T>): void },
    load: () => Promise<T>,
  ): Promise<void> {
    if (!allowed) {
      target.set(LOCKED)
      return
    }
    target.set({ state: 'loading' })
    try {
      target.set({ state: 'ok', value: await load() })
    } catch {
      target.set({ state: 'failed' })
    }
  }

  private async loadLatestReports(): Promise<void> {
    if (!this.canReports()) return
    try {
      const page = await this.listReports.execute({
        page: 1,
        filter: { status: 'OPEN', sort: { field: 'createdAt', direction: 'desc' } },
      })
      this.latestReports.set(page.items.slice(0, 2))
    } catch {
      this.latestReports.set([])
    }
  }
}

function okValue<T>(source: Optional<T>): T | null {
  return source.state === 'ok' ? source.value : null
}

/** A sparkline path in a 240×44 box, or `null` when there is nothing to draw. */
function sparkPath(values: number[]): string | null {
  if (values.length < 2) return null
  const max = Math.max(...values)
  const min = Math.min(...values)
  const step = 240 / (values.length - 1)
  return values
    .map((value, index) => {
      const y = 44 - ((value - min) / (max - min || 1)) * 38 - 3
      return `${index === 0 ? 'M' : 'L'}${(index * step).toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}
