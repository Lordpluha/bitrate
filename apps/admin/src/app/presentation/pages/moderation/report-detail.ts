import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { AdvanceReportUseCase, GetReportUseCase } from '@application/moderation'
import { SessionStore } from '@application/session'
import {
  canAdvanceTo,
  isReportClosed,
  type ModerationEntityType,
  type ModerationStatus,
  type ModerationSubject,
  type ReportDetail,
} from '@domain/moderation'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import {
  lucideArrowRight,
  lucideAudioLines,
  lucideCheck,
  lucideEye,
  lucideFlag,
  lucideList,
  lucideX,
} from '@ng-icons/lucide'
import { KvRow, PageHeader, Skeleton, StateMessage, Tile, TileGrid } from '@presentation/components'
import { LocaleStore } from '@presentation/navigation'
import { ElapsedPipe, LocalizedDatePipe } from '@presentation/pipes'
import { createDetailResource } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmDialogImports } from '@spartan-ng/helm/dialog'
import { HlmTableImports } from '@spartan-ng/helm/table'

/** The pill each report status wears — the same as in the queue. */
const STATUS_BADGE: Record<ModerationStatus, 'warning' | 'info' | 'success' | 'secondary'> = {
  OPEN: 'warning',
  REVIEWING: 'info',
  RESOLVED: 'success',
  REJECTED: 'secondary',
}

const STATUS_LABEL: Record<ModerationStatus, string> = {
  OPEN: 'moderation.status.OPEN',
  REVIEWING: 'moderation.status.REVIEWING',
  RESOLVED: 'moderation.status.RESOLVED',
  REJECTED: 'moderation.status.REJECTED',
}

const TYPE_LABEL: Record<ModerationEntityType, string> = {
  track: 'moderation.type.track',
  album: 'moderation.type.album',
  playlist: 'moderation.type.playlist',
  artist: 'moderation.type.artist',
  user: 'moderation.type.user',
}

/** A closing decision asks first: what it does, and the button that does it. */
type Decision = 'RESOLVED' | 'REJECTED'

const DECISION: Record<Decision, { title: string; desc: string; action: string }> = {
  RESOLVED: {
    title: 'report.dialog.resolveTitle',
    desc: 'report.dialog.resolveDesc',
    action: 'report.dialog.resolveAction',
  },
  REJECTED: {
    title: 'report.dialog.rejectTitle',
    desc: 'report.dialog.rejectDesc',
    action: 'report.dialog.rejectAction',
  },
}

const ERROR: Record<'load' | 'advance', string> = {
  load: 'report.error.load',
  advance: 'report.error.advance',
}

/** Subject kinds with a panel detail page to link to, by route prefix. Albums have no link here yet. */
const SUBJECT_ROUTE_PREFIX: ReadonlyMap<string, string> = new Map([
  ['track', '/catalog'],
  ['artist', '/artists'],
  ['user', '/users'],
  ['playlist', '/playlists'],
])

function isKnownType(kind: string): kind is ModerationEntityType {
  return Object.hasOwn(TYPE_LABEL, kind)
}

@Component({
  selector: 'app-report-detail',
  imports: [
    ElapsedPipe,
    HlmBadgeImports,
    HlmButtonImports,
    HlmDialogImports,
    HlmTableImports,
    KvRow,
    LocalizedDatePipe,
    NgIcon,
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
      lucideArrowRight,
      lucideAudioLines,
      lucideCheck,
      lucideEye,
      lucideFlag,
      lucideList,
      lucideX,
    }),
  ],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './report-detail.html',
})
export class ReportDetailPage {
  private readonly route = inject(ActivatedRoute)
  private readonly getReport = inject(GetReportUseCase)
  private readonly advanceReport = inject(AdvanceReportUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  protected readonly canAdvance = inject(SessionStore).can('reports:advance')
  protected readonly reportId = this.route.snapshot.paramMap.get('id') ?? ''
  protected readonly statusBadge = STATUS_BADGE
  protected readonly statusLabel = STATUS_LABEL
  protected readonly decisionCopy = DECISION

  private readonly record = createDetailResource({
    load: () => this.getReport.execute(this.reportId),
    errorMessage: ERROR.load,
  })

  protected readonly report = this.record.value
  protected readonly loading = this.record.loading
  protected readonly notFound = this.record.notFound
  protected readonly failure = this.record.failure
  protected readonly pending = signal(false)
  /** The closing decision waiting for confirmation, if any. */
  protected readonly confirming = signal<Decision | null>(null)

  protected readonly back = computed(() => ({
    link: '/moderation',
    label: this.t('moderation.title'),
  }))
  protected readonly failureText = computed(() => {
    const key = this.failure()
    return key === null ? null : this.t(key)
  })

  constructor() {
    void this.record.reload()
  }

  protected reload(): void {
    this.failure.set(null)
    void this.record.reload()
  }

  protected shortId(id: string): string {
    return id.slice(0, 8).toUpperCase()
  }

  protected kindName(kind: string): string {
    return isKnownType(kind) ? this.t(TYPE_LABEL[kind]) : kind
  }

  protected advanceable(report: ReportDetail, status: ModerationStatus): boolean {
    return canAdvanceTo({ report, status })
  }

  protected closed(report: ReportDetail): boolean {
    return isReportClosed(report)
  }

  protected subjectLink(subject: ModerationSubject): readonly [string, string] | null {
    const prefix = SUBJECT_ROUTE_PREFIX.get(subject.kind)
    return prefix === undefined ? null : [prefix, subject.id]
  }

  protected ask(decision: Decision): void {
    this.confirming.set(decision)
  }

  protected dismissDialog(): void {
    if (!this.pending()) this.confirming.set(null)
  }

  protected async confirm(): Promise<void> {
    const decision = this.confirming()
    if (decision === null) return
    await this.advance(decision)
    this.confirming.set(null)
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
      this.failure.set(ERROR.advance)
    } finally {
      this.pending.set(false)
    }
  }

  private t(key: string, params: Record<string, unknown> = {}): string {
    return this.transloco.translate(key, params, this.locale())
  }
}
