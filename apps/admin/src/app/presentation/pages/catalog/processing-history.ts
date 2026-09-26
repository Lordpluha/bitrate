import { ChangeDetectionStrategy, Component, effect, inject, input, untracked } from '@angular/core'
import { ListProcessingAttemptsUseCase } from '@application/catalog'
import {
  attemptOutcomeLabel,
  hasDiagnostics,
  isAttemptRunningTooLong,
  type ProcessingAttempt,
  type TrackProcessingStatus,
} from '@domain/track'
import { CollectionStatus, Paginator } from '@presentation/components'
import { LocalizedDatePipe } from '@presentation/pipes'
import { createCollection } from '@presentation/state'
import { HlmBadgeImports, type BadgeVariants } from '@spartan-ng/helm/badge'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { humaniseDurationMs } from './duration.formatter'
import { ProcessingAttemptDiagnostics } from './processing-attempt-diagnostics'

const BADGE_VARIANT: Record<ProcessingAttempt['status'], NonNullable<BadgeVariants['variant']>> = {
  SUCCEEDED: 'default',
  FAILED: 'destructive',
  RUNNING: 'outline',
  STALLED: 'outline',
  SUPERSEDED: 'outline',
}

/**
 * The "Processing history" section on `/catalog/:id`. Page state is local to this component, not
 * URL-bound: this is a subsection of the detail page, not a list screen — see
 * `.claude/rules/admin-rules.md` § "List state lives in the URL", which applies to list screens.
 */
@Component({
  selector: 'app-processing-history',
  imports: [
    LocalizedDatePipe,
    CollectionStatus,
    Paginator,
    HlmBadgeImports,
    HlmTableImports,
    ProcessingAttemptDiagnostics,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './processing-history.html',
})
export class ProcessingHistory {
  private readonly listAttempts = inject(ListProcessingAttemptsUseCase)

  readonly trackId = input.required<string>()
  /** The track's own summary fields, for the pre-history empty state — see Decision 9. */
  readonly legacyStatus = input<TrackProcessingStatus>()
  readonly legacyError = input<string | null>(null)

  protected readonly collection = createCollection<ProcessingAttempt>({
    errorMessage: 'Could not load processing history.',
    load: (page) => this.listAttempts.execute({ trackId: this.trackId(), page }),
  })

  /**
   * Deferred to an `effect` rather than called eagerly in the constructor: a required signal
   * input is only guaranteed set once Angular has applied the incoming bindings, which is after
   * the constructor body runs — reading it any earlier throws NG0950.
   */
  constructor() {
    effect(() => {
      this.trackId()
      untracked(() => void this.collection.restart())
    })
  }

  /** Called by the track detail page after a successful reprocess, so history catches up. */
  reload(): Promise<void> {
    return this.collection.reload()
  }

  protected label(attempt: ProcessingAttempt): string {
    return attemptOutcomeLabel(attempt)
  }

  protected badgeVariant(attempt: ProcessingAttempt): NonNullable<BadgeVariants['variant']> {
    return BADGE_VARIANT[attempt.status]
  }

  protected runningTooLong(attempt: ProcessingAttempt): boolean {
    return isAttemptRunningTooLong({ attempt })
  }

  protected showDiagnostics(attempt: ProcessingAttempt): boolean {
    return hasDiagnostics(attempt)
  }

  protected duration(attempt: ProcessingAttempt): string {
    return attempt.durationMs === null ? '—' : humaniseDurationMs(attempt.durationMs)
  }

  protected retryLabel(attempt: ProcessingAttempt): string {
    if (attempt.willRetry) return 'Will retry'
    if (attempt.retryable) return 'Likely transient'
    return ''
  }

  protected showLegacyError(): boolean {
    return (
      !this.collection.loading() &&
      this.collection.items().length === 0 &&
      this.legacyStatus() === 'FAILED' &&
      this.legacyError() !== null
    )
  }

  protected goToPage(page: number): void {
    void this.collection.goTo(page)
  }
}
