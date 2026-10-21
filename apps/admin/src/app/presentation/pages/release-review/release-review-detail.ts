import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { DecideReleaseUseCase, GetReleaseSubmissionUseCase } from '@application/release-review'
import { SessionStore } from '@application/session'
import {
  canDecideOnRelease,
  normalizeReviewItems,
  REVIEW_LIMITS,
  ReleaseReviewError,
  type ReleaseSubmissionDetail,
} from '@domain/release-review'
import { ActionNotAllowedError, ResourceNotFoundError } from '@domain/shared'
import { LocalizedDatePipe } from '@presentation/pipes'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmLabelImports } from '@spartan-ng/helm/label'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { RELEASE_KIND_LABELS, RELEASE_STATUS_BADGES, RELEASE_STATUS_LABELS } from './release-labels'

/** The decision form currently open; `null` while the reviewer is only reading. */
type DecisionMode = 'approve' | 'changes' | null

const BLOCKER_LABELS: Record<string, string> = {
  NO_TRACKS: 'No recordings',
  COVER_MISSING: 'No artwork',
  TRACK_AUDIO_MISSING: 'A recording has no audio',
  MASTER_OWNER_MISSING: 'Master owner not set',
  WRITERS_NOT_CONFIRMED: 'Writers not confirmed',
  ACCURACY_NOT_CONFIRMED: 'Accuracy not confirmed',
  CONTRIBUTOR_ROLES_MISSING: 'A contributor has no role',
  SPLITS_INCOMPLETE: 'Splits do not add up to 100%',
}

const NOTICE_LABELS: Record<string, string> = {
  UPC_MISSING: 'No UPC yet',
  ISRC_MISSING: 'A recording has no ISRC yet',
}

const DESTINATION_LABELS: Record<string, string> = {
  SPOTIFY: 'Spotify',
  APPLE_MUSIC: 'Apple Music',
  YOUTUBE_MUSIC: 'YouTube Music',
  AMAZON_MUSIC: 'Amazon Music',
  DEEZER: 'Deezer',
  TIDAL: 'TIDAL',
}

const RIGHT_LABELS: Record<string, string> = {
  RECORDING: 'Recording (master)',
  COMPOSITION: 'Composition (publishing)',
}

const BASIS_POINTS_PER_PERCENT = 100

function lines(value: string): string[] {
  return normalizeReviewItems(value.split('\n'))
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return '—'
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

/**
 * Over 100 lines: loading, the decision form's armed state and failure reporting describe one
 * reviewer action on one submission — the same reason `album-detail.ts` gives for its size.
 */
@Component({
  selector: 'app-release-review-detail',
  imports: [
    LocalizedDatePipe,
    RouterLink,
    HlmBadgeImports,
    HlmButtonImports,
    HlmLabelImports,
    HlmTableImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './release-review-detail.html',
})
export class ReleaseReviewDetailPage {
  private readonly route = inject(ActivatedRoute)
  private readonly getRelease = inject(GetReleaseSubmissionUseCase)
  private readonly decide = inject(DecideReleaseUseCase)
  private readonly session = inject(SessionStore)

  protected readonly canReview = this.session.can('releases:review')
  protected readonly releaseId = this.route.snapshot.paramMap.get('id') ?? ''
  protected readonly limits = REVIEW_LIMITS
  protected readonly kindLabels = RELEASE_KIND_LABELS
  protected readonly statusLabels = RELEASE_STATUS_LABELS
  protected readonly statusBadges = RELEASE_STATUS_BADGES
  protected readonly blockerLabels = BLOCKER_LABELS
  protected readonly noticeLabels = NOTICE_LABELS
  protected readonly destinationLabels = DESTINATION_LABELS
  protected readonly rightLabels = RIGHT_LABELS
  protected readonly formatDuration = formatDuration

  protected readonly release = signal<ReleaseSubmissionDetail | null>(null)
  protected readonly loading = signal(true)
  protected readonly notFound = signal(false)
  protected readonly failure = signal<string | null>(null)
  protected readonly status = signal<string | null>(null)
  protected readonly mode = signal<DecisionMode>(null)
  protected readonly message = signal('')
  protected readonly requiredText = signal('')
  protected readonly recommendationText = signal('')
  protected readonly working = signal(false)

  protected readonly requiredCount = computed(() => lines(this.requiredText()).length)
  protected readonly contributorNames = computed(
    () =>
      new Map(
        (this.release()?.contributors ?? []).map((person) => [person.id, person.displayName]),
      ),
  )

  constructor() {
    void this.load()
  }

  protected decidable(release: ReleaseSubmissionDetail): boolean {
    return canDecideOnRelease(release).allowed
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
        this.status.set(`"${current.title}" was approved. The artist sees the decision now.`)
      } else {
        await this.decide.requestChanges({
          release: current,
          requiredChanges: lines(this.requiredText()),
          recommendations: lines(this.recommendationText()),
          message: this.message(),
        })
        this.status.set(`Changes were requested on "${current.title}".`)
      }
      this.mode.set(null)
      this.message.set('')
      this.requiredText.set('')
      this.recommendationText.set('')
      await this.load()
    } catch (error) {
      this.failure.set(this.describe(error))
      if (error instanceof ReleaseReviewError && error.reason === 'stale') await this.load()
    } finally {
      this.working.set(false)
    }
  }

  private describe(error: unknown): string {
    if (error instanceof ActionNotAllowedError) return error.message
    if (error instanceof ReleaseReviewError) {
      switch (error.reason) {
        case 'stale':
          return 'The release changed or was already decided. It was reloaded; check it again.'
        case 'not-found':
          return 'This release no longer exists.'
        case 'invalid':
          return 'The API refused the review. Check the lengths and that no item repeats.'
        case 'unknown':
          break
      }
    }
    return 'Could not save the decision. Please try again.'
  }

  private async load(): Promise<void> {
    this.loading.set(true)
    try {
      this.release.set(await this.getRelease.execute(this.releaseId))
      this.notFound.set(false)
    } catch (error) {
      if (error instanceof ResourceNotFoundError) this.notFound.set(true)
      else this.failure.set('Could not load this release.')
    } finally {
      this.loading.set(false)
    }
  }
}
