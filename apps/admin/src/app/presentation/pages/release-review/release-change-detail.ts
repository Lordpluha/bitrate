import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import {
  DecideReleaseChangesUseCase,
  GetReleaseChangeRequestUseCase,
} from '@application/release-review'
import { SessionStore } from '@application/session'
import {
  canDecideChange,
  REVIEW_LIMITS,
  type ReleaseChange,
  type ReleaseChangeDecision,
  type ReleaseChangeField,
  type ReleaseChangeStatus,
  ReleaseReviewError,
} from '@domain/release-review'
import { ActionNotAllowedError } from '@domain/shared'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideArrowRight, lucideCheck, lucideDisc3, lucideX } from '@ng-icons/lucide'
import { MarkdownEditor, PageHeader, StateMessage, Tile, TileGrid } from '@presentation/components'
import { LocaleStore } from '@presentation/navigation'
import { ElapsedPipe, LocalizedDatePipe, MarkdownPipe } from '@presentation/pipes'
import { createDetailResource } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmLabelImports } from '@spartan-ng/helm/label'
import { type StatusBadgeVariant } from './release-labels'

/** What the reviewer picked for one pending change, before sending. */
type Choice = { decision: 'APPROVE' | 'REJECT'; reason: string }

type Notice = { key: string; params?: Record<string, string | number> }

const FIELD_KEYS: Record<ReleaseChangeField, string> = {
  RELEASE_TITLE: 'releaseChange.field.RELEASE_TITLE',
  RELEASE_COVER: 'releaseChange.field.RELEASE_COVER',
  RECORDING_TITLE: 'releaseChange.field.RECORDING_TITLE',
}

const STATUS_KEYS: Record<ReleaseChangeStatus, string> = {
  PENDING: 'releaseChange.status.PENDING',
  APPROVED: 'releaseChange.status.APPROVED',
  REJECTED: 'releaseChange.status.REJECTED',
  WITHDRAWN: 'releaseChange.status.WITHDRAWN',
  CANCELLED: 'releaseChange.status.CANCELLED',
}

const STATUS_BADGES = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
  WITHDRAWN: 'secondary',
  CANCELLED: 'secondary',
} as const satisfies Record<ReleaseChangeStatus, StatusBadgeVariant>

const FAILURE: Record<'stale' | 'not-found' | 'invalid' | 'notAllowed' | 'other', string> = {
  stale: 'releaseChange.error.stale',
  'not-found': 'releaseChange.error.gone',
  invalid: 'releaseChange.error.invalid',
  notAllowed: 'releaseChange.error.reasonMissing',
  other: 'releaseChange.error.save',
}

/**
 * One change request: every change as before → after, decided one by one. Over 100 lines because
 * the per-change choices and the single submit that sends them describe one reviewer action.
 */
@Component({
  selector: 'app-release-change-detail',
  imports: [
    ElapsedPipe,
    HlmBadgeImports,
    HlmButtonImports,
    HlmLabelImports,
    LocalizedDatePipe,
    MarkdownEditor,
    MarkdownPipe,
    NgIcon,
    PageHeader,
    RouterLink,
    StateMessage,
    Tile,
    TileGrid,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideArrowRight, lucideCheck, lucideDisc3, lucideX })],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './release-change-detail.html',
})
export class ReleaseChangeDetailPage {
  private readonly route = inject(ActivatedRoute)
  private readonly getRequest = inject(GetReleaseChangeRequestUseCase)
  private readonly decide = inject(DecideReleaseChangesUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  protected readonly canReview = inject(SessionStore).can('releases:review')
  protected readonly requestId = this.route.snapshot.paramMap.get('id') ?? ''
  protected readonly limits = REVIEW_LIMITS
  protected readonly fieldKeys = FIELD_KEYS
  protected readonly statusKeys = STATUS_KEYS
  protected readonly statusBadges = STATUS_BADGES

  private readonly record = createDetailResource({
    load: () => this.getRequest.execute(this.requestId),
    errorMessage: 'releaseChange.error.load',
  })

  protected readonly request = this.record.value
  protected readonly loading = this.record.loading
  protected readonly notFound = this.record.notFound
  protected readonly failure = this.record.failure
  protected readonly notice = signal<Notice | null>(null)
  protected readonly choices = signal<Record<string, Choice>>({})
  /** Optional comment on the whole request, in Markdown. */
  protected readonly message = signal('')
  protected readonly working = signal(false)

  protected readonly back = computed(() => ({
    link: '/release-changes',
    label: this.t('releaseChanges.title'),
  }))
  protected readonly pending = computed(() =>
    (this.request()?.changes ?? []).filter((change) => canDecideChange(change).allowed),
  )
  /** Ready to send: something is chosen and every rejection says why. */
  protected readonly ready = computed(() => {
    const chosen = Object.values(this.choices())
    return (
      chosen.length > 0 &&
      chosen.every((choice) => choice.decision === 'APPROVE' || choice.reason.trim().length > 0)
    )
  })
  protected readonly failureText = computed(() => {
    const key = this.failure()
    return key === null ? null : this.t(key)
  })
  protected readonly noticeText = computed(() => {
    const notice = this.notice()
    return notice === null ? null : this.t(notice.key, notice.params)
  })

  constructor() {
    void this.record.reload()
  }

  protected reload(): void {
    this.failure.set(null)
    void this.record.reload()
  }

  protected choiceOf(change: ReleaseChange): Choice | undefined {
    return this.choices()[change.id]
  }

  protected choose(change: ReleaseChange, decision: Choice['decision']): void {
    this.choices.update((current) => ({
      ...current,
      [change.id]: { decision, reason: current[change.id]?.reason ?? '' },
    }))
  }

  protected setReason(change: ReleaseChange, reason: string): void {
    this.choices.update((current) => ({
      ...current,
      [change.id]: { decision: 'REJECT', reason },
    }))
  }

  /** Picks the same outcome for every pending change, keeping reasons already typed. */
  protected chooseAll(decision: Choice['decision']): void {
    for (const change of this.pending()) this.choose(change, decision)
  }

  protected async submit(): Promise<void> {
    const current = this.request()
    if (!current || this.working() || !this.ready()) return
    const decisions = Object.entries(this.choices()).map(
      ([changeId, choice]): ReleaseChangeDecision =>
        choice.decision === 'APPROVE'
          ? { changeId, decision: 'APPROVE' }
          : { changeId, decision: 'REJECT', reason: choice.reason },
    )
    this.working.set(true)
    this.failure.set(null)
    this.notice.set(null)
    try {
      await this.decide.execute({ request: current, decisions, message: this.message() })
      await this.record.reload()
      this.choices.set({})
      this.message.set('')
      this.notice.set({ key: 'releaseChange.decided', params: { count: decisions.length } })
    } catch (error) {
      this.failure.set(this.describe(error))
      if (error instanceof ReleaseReviewError && error.reason === 'stale') {
        this.choices.set({})
        await this.record.reload()
      }
    } finally {
      this.working.set(false)
    }
  }

  private describe(error: unknown): string {
    if (error instanceof ActionNotAllowedError) return FAILURE.notAllowed
    if (error instanceof ReleaseReviewError && error.reason !== 'unknown') {
      return FAILURE[error.reason]
    }
    return FAILURE.other
  }

  private t(key: string, params: Record<string, string | number> = {}): string {
    return this.transloco.translate(key, params, this.locale())
  }
}
