import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import {
  DecideReleaseUseCase,
  GetReleaseSubmissionUseCase,
  RetryPublishingUseCase,
  TakeDownReleaseUseCase,
} from '@application/release-review'
import { SessionStore } from '@application/session'
import {
  canDecideOnRelease,
  canRetryPublishing,
  canTakeDownRelease,
  REVIEW_LIMITS,
  ReleaseReviewError,
  type ReleaseSubmissionDetail,
} from '@domain/release-review'
import { ActionNotAllowedError } from '@domain/shared'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import {
  lucideArrowRight,
  lucideAudioLines,
  lucideCheck,
  lucideCircleAlert,
  lucideClock,
  lucideDisc3,
  lucideHistory,
  lucidePencil,
  lucideRotateCw,
  lucideShieldCheck,
  lucideUsers,
} from '@ng-icons/lucide'
import {
  KvRow,
  MarkdownEditor,
  PageHeader,
  Skeleton,
  StateMessage,
  Tile,
  TileGrid,
} from '@presentation/components'
import { LocaleStore } from '@presentation/navigation'
import { formatClockDuration } from '@presentation/pages/shared/duration.formatter'
import { ElapsedPipe, LocalizedDatePipe, MarkdownPipe } from '@presentation/pipes'
import { createDetailResource } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmDialogImports } from '@spartan-ng/helm/dialog'
import { HlmLabelImports } from '@spartan-ng/helm/label'
import { HlmTableImports } from '@spartan-ng/helm/table'
import {
  RELEASE_BLOCKER_KEYS,
  RELEASE_DESTINATION_LABELS,
  RELEASE_KIND_KEYS,
  RELEASE_NOTICE_KEYS,
  RELEASE_RIGHT_KEYS,
  RELEASE_ROLE_KEYS,
  RELEASE_STATUS_BADGES,
  RELEASE_STATUS_KEYS,
} from './release-labels'

/** The decision dialog currently open; `null` while the reviewer is only reading. */
type DecisionMode = 'approve' | 'changes' | null

/** A banner's copy: a transloco key and its parameters. */
type Notice = { key: string; params?: Record<string, string> }

const BASIS_POINTS_PER_PERCENT = 100

/** Why a decision failed, by refusal reason; anything unexpected is the generic one. */
const FAILURE: Record<'stale' | 'not-found' | 'invalid' | 'notAllowed' | 'other', string> = {
  stale: 'release.error.stale',
  'not-found': 'release.error.gone',
  invalid: 'release.error.invalid',
  notAllowed: 'release.decision.notAwaiting',
  other: 'release.error.save',
}

/**
 * Over 100 lines: the decision dialogs' armed state and failure reporting describe one reviewer
 * action on one submission, so they stay together.
 */
@Component({
  selector: 'app-release-review-detail',
  imports: [
    ElapsedPipe,
    HlmBadgeImports,
    HlmButtonImports,
    HlmDialogImports,
    HlmLabelImports,
    HlmTableImports,
    KvRow,
    LocalizedDatePipe,
    MarkdownEditor,
    MarkdownPipe,
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
      lucideCircleAlert,
      lucideClock,
      lucideDisc3,
      lucideHistory,
      lucidePencil,
      lucideRotateCw,
      lucideShieldCheck,
      lucideUsers,
    }),
  ],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './release-review-detail.html',
})
export class ReleaseReviewDetailPage {
  private readonly route = inject(ActivatedRoute)
  private readonly getRelease = inject(GetReleaseSubmissionUseCase)
  private readonly decide = inject(DecideReleaseUseCase)
  private readonly retry = inject(RetryPublishingUseCase)
  private readonly takeDownRelease = inject(TakeDownReleaseUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  protected readonly canReview = inject(SessionStore).can('releases:review')
  protected readonly releaseId = this.route.snapshot.paramMap.get('id') ?? ''
  protected readonly limits = REVIEW_LIMITS
  protected readonly kindKeys = RELEASE_KIND_KEYS
  protected readonly statusKeys = RELEASE_STATUS_KEYS
  protected readonly statusBadges = RELEASE_STATUS_BADGES
  protected readonly blockerKeys = RELEASE_BLOCKER_KEYS
  protected readonly noticeKeys = RELEASE_NOTICE_KEYS
  protected readonly destinationLabels = RELEASE_DESTINATION_LABELS
  protected readonly rightKeys = RELEASE_RIGHT_KEYS
  protected readonly formatDuration = formatClockDuration

  private readonly record = createDetailResource({
    load: () => this.getRelease.execute(this.releaseId),
    errorMessage: 'release.error.load',
  })

  protected readonly release = this.record.value
  protected readonly loading = this.record.loading
  protected readonly notFound = this.record.notFound
  protected readonly failure = this.record.failure
  protected readonly status = signal<Notice | null>(null)
  protected readonly mode = signal<DecisionMode>(null)
  /** The reviewer's Markdown feedback; required when requesting changes. */
  protected readonly message = signal('')
  protected readonly working = signal(false)

  protected readonly hasFeedback = computed(() => this.message().trim().length > 0)
  protected readonly back = computed(() => ({ link: '/releases', label: this.t('releases.title') }))
  protected readonly failureText = computed(() => {
    const key = this.failure()
    return key === null ? null : this.t(key)
  })
  protected readonly statusText = computed(() => {
    const notice = this.status()
    return notice === null ? null : this.t(notice.key, notice.params)
  })

  /** How many of the two rights confirmations (master owner, accuracy) the artist has made. */
  protected readonly confirmed = computed(() => {
    const r = this.release()
    if (!r) return 0
    return [r.masterOwnerType, r.accuracyConfirmedAt].filter(Boolean).length
  })
  protected readonly totalLength = computed(() =>
    (this.release()?.tracks ?? []).reduce((sum, track) => sum + (track.durationSeconds ?? 0), 0),
  )

  constructor() {
    void this.record.reload()
  }

  protected reload(): void {
    this.failure.set(null)
    void this.record.reload()
  }

  protected decidable(release: ReleaseSubmissionDetail): boolean {
    return canDecideOnRelease(release).allowed
  }

  protected retryable(release: ReleaseSubmissionDetail): boolean {
    return canRetryPublishing(release).allowed
  }

  protected takeDownable(release: ReleaseSubmissionDetail): boolean {
    return canTakeDownRelease(release).allowed
  }

  /** Restarts a failed publication, then reloads to show it publishing again. */
  protected retryPublishing(): Promise<void> {
    return this.publicationAction(
      (release) => this.retry.execute(release),
      'release.decision.publishingRetried',
    )
  }

  /** Takes a live release offline for listeners, then reloads. */
  protected takeDown(): Promise<void> {
    return this.publicationAction(
      (release) => this.takeDownRelease.execute(release),
      'release.decision.takenDown',
    )
  }

  private async publicationAction(
    run: (release: ReleaseSubmissionDetail) => Promise<void>,
    notice: string,
  ): Promise<void> {
    const current = this.release()
    if (!current || this.working()) return
    this.working.set(true)
    this.failure.set(null)
    this.status.set(null)
    try {
      await run(current)
      this.status.set({ key: notice, params: { title: current.title } })
      await this.record.reload()
    } catch (error) {
      this.failure.set(this.describe(error))
      if (error instanceof ReleaseReviewError && error.reason === 'stale')
        await this.record.reload()
    } finally {
      this.working.set(false)
    }
  }

  /** "Performer, Producer" in the active language; `—` for a contributor with no role. */
  protected roleNames(roles: readonly string[]): string {
    if (roles.length === 0) return '—'
    return roles
      .map((role) => (RELEASE_ROLE_KEYS[role] ? this.t(RELEASE_ROLE_KEYS[role]) : role))
      .join(', ')
  }

  protected audioUrl(trackId: string): string {
    return this.getRelease.audioUrl(this.releaseId, trackId)
  }

  protected percent(basisPoints: number): string {
    return `${(basisPoints / BASIS_POINTS_PER_PERCENT).toFixed(2).replace(/\.?0+$/, '')}%`
  }

  protected open(mode: DecisionMode): void {
    this.failure.set(null)
    this.status.set(null)
    this.mode.set(mode)
  }

  protected cancel(): void {
    if (!this.working()) this.mode.set(null)
  }

  protected async submit(): Promise<void> {
    const current = this.release()
    const mode = this.mode()
    if (!current || !mode || this.working()) return

    this.working.set(true)
    this.failure.set(null)
    try {
      if (mode === 'approve') {
        await this.decide.approve({ release: current, message: this.message() })
        this.status.set({ key: 'release.decision.approved', params: { title: current.title } })
      } else {
        await this.decide.requestChanges({ release: current, message: this.message() })
        this.status.set({ key: 'release.decision.changesSent', params: { title: current.title } })
      }
      this.mode.set(null)
      this.message.set('')
      await this.record.reload()
    } catch (error) {
      this.mode.set(null)
      this.failure.set(this.describe(error))
      if (error instanceof ReleaseReviewError && error.reason === 'stale')
        await this.record.reload()
    } finally {
      this.working.set(false)
    }
  }

  private describe(error: unknown): string {
    if (error instanceof ActionNotAllowedError) return FAILURE.notAllowed
    if (error instanceof ReleaseReviewError && error.reason !== 'unknown')
      return FAILURE[error.reason]
    return FAILURE.other
  }

  private t(key: string, params: Record<string, string | number> = {}): string {
    return this.transloco.translate(key, params, this.locale())
  }
}
