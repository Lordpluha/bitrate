import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import {
  GetPodcastUseCase,
  RestorePodcastEpisodeUseCase,
  RestorePodcastUseCase,
  TakeDownPodcastEpisodeUseCase,
  TakeDownPodcastUseCase,
} from '@application/podcasts'
import { SessionStore } from '@application/session'
import {
  canRestoreEpisode,
  canRestorePodcast,
  canTakeDownEpisode,
  canTakeDownPodcast,
  type PodcastDetail,
  type PodcastEpisode,
} from '@domain/podcast'
import { LocalizedDatePipe } from '@presentation/pipes'
import {
  isStaleStateError,
  resourceWriteErrorMessage,
} from '@presentation/pages/shared/resource-write-error.message'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmDialogImports } from '@spartan-ng/helm/dialog'
import { HlmLabelImports } from '@spartan-ng/helm/label'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { HlmTabsImports } from '@spartan-ng/helm/tabs'

/** Mirrors the API's `TakeDownReasonSchema` limit. */
const REASON_MAX_LENGTH = 500

/** The write the open dialog will perform, and what it targets; `null` while it is closed. */
type PendingAction =
  | { kind: 'podcast'; action: 'take-down' | 'restore' }
  | { kind: 'episode'; action: 'take-down' | 'restore'; episode: PodcastEpisode }
  | null

/**
 * Over 100 lines: load state, the confirm dialog's armed state for two targets (the podcast and
 * one of its episodes) and failure reporting share one operator record — the same justification
 * `album-detail.ts` gives for its own size.
 */
@Component({
  selector: 'app-podcast-detail',
  imports: [
    LocalizedDatePipe,
    RouterLink,
    HlmBadgeImports,
    HlmButtonImports,
    HlmDialogImports,
    HlmLabelImports,
    HlmTableImports,
    HlmTabsImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './podcast-detail.html',
})
export class PodcastDetailPage {
  private readonly route = inject(ActivatedRoute)
  private readonly getPodcast = inject(GetPodcastUseCase)
  private readonly takeDownPodcast = inject(TakeDownPodcastUseCase)
  private readonly restorePodcast = inject(RestorePodcastUseCase)
  private readonly takeDownEpisode = inject(TakeDownPodcastEpisodeUseCase)
  private readonly restoreEpisode = inject(RestorePodcastEpisodeUseCase)

  private readonly session = inject(SessionStore)

  /** Episodes reuse the podcast permissions — there are no separate episode grants. */
  protected readonly canTakeDown = this.session.can('podcasts:delete')
  protected readonly canRestore = this.session.can('podcasts:restore')
  protected readonly podcastId = this.route.snapshot.paramMap.get('id') ?? ''
  protected readonly reasonMaxLength = REASON_MAX_LENGTH

  protected readonly podcast = signal<PodcastDetail | null>(null)
  protected readonly loading = signal(true)
  protected readonly notFound = signal(false)
  protected readonly failure = signal<string | null>(null)
  protected readonly status = signal<string | null>(null)
  protected readonly pendingAction = signal<PendingAction>(null)
  protected readonly reason = signal('')
  protected readonly working = signal(false)

  constructor() {
    void this.load()
  }

  protected podcastTakeDownable(podcast: PodcastDetail): boolean {
    return canTakeDownPodcast(podcast).allowed
  }

  protected podcastRestorable(podcast: PodcastDetail): boolean {
    return canRestorePodcast(podcast).allowed
  }

  protected episodeTakeDownable(episode: PodcastEpisode): boolean {
    return canTakeDownEpisode(episode).allowed
  }

  protected episodeRestorable(episode: PodcastEpisode): boolean {
    return canRestoreEpisode(episode).allowed
  }

  protected lengthLabel(episode: PodcastEpisode): string {
    return episode.durationSeconds === null
      ? '—'
      : `${Math.round(episode.durationSeconds / 60)} min`
  }

  protected askPodcast(action: 'take-down' | 'restore'): void {
    this.arm({ kind: 'podcast', action })
  }

  protected askEpisode(episode: PodcastEpisode, action: 'take-down' | 'restore'): void {
    this.arm({ kind: 'episode', action, episode })
  }

  /** What the open dialog is about, for its title and description. */
  protected targetLabel(pending: NonNullable<PendingAction>): string {
    return pending.kind === 'podcast' ? 'podcast' : 'episode'
  }

  protected targetTitle(pending: NonNullable<PendingAction>): string {
    return pending.kind === 'podcast' ? (this.podcast()?.title ?? '') : pending.episode.title
  }

  /** Closing mid-write is ignored so the dialog cannot vanish under an in-flight request. */
  protected cancel(): void {
    if (!this.working()) this.pendingAction.set(null)
  }

  protected async confirm(): Promise<void> {
    const current = this.podcast()
    const pending = this.pendingAction()
    if (!current || !pending || this.working()) return

    const reason = this.reason().trim() || undefined
    const label = `"${this.targetTitle(pending)}"`
    this.working.set(true)
    this.failure.set(null)
    try {
      await this.perform(current, pending, reason)
      this.status.set(this.successMessage(pending, label))
      await this.load()
    } catch (error) {
      this.failure.set(
        resourceWriteErrorMessage({
          error,
          action: pending.action === 'take-down' ? 'take down' : 'restore',
          label,
          resource: pending.kind,
        }),
      )
      if (isStaleStateError(error)) await this.load()
    } finally {
      this.working.set(false)
      this.pendingAction.set(null)
    }
  }

  private arm(pending: NonNullable<PendingAction>): void {
    this.reason.set('')
    this.failure.set(null)
    this.status.set(null)
    this.pendingAction.set(pending)
  }

  private async perform(
    current: PodcastDetail,
    pending: NonNullable<PendingAction>,
    reason: string | undefined,
  ): Promise<void> {
    if (pending.kind === 'podcast') {
      if (pending.action === 'take-down') {
        await this.takeDownPodcast.execute({ podcast: current, reason })
      } else {
        await this.restorePodcast.execute({ podcast: current, reason })
      }
      return
    }

    if (pending.action === 'take-down') {
      await this.takeDownEpisode.execute({ episode: pending.episode, reason })
    } else {
      await this.restoreEpisode.execute({ episode: pending.episode, reason })
    }
  }

  private successMessage(pending: NonNullable<PendingAction>, label: string): string {
    if (pending.action === 'restore') return `${label} was restored.`
    return pending.kind === 'podcast'
      ? `${label} was taken down. Its episodes were not changed.`
      : `${label} was taken down. The podcast and its other episodes were not changed.`
  }

  private async load(): Promise<void> {
    this.loading.set(true)
    try {
      this.podcast.set(await this.getPodcast.execute(this.podcastId))
      this.notFound.set(false)
    } catch {
      this.notFound.set(true)
    } finally {
      this.loading.set(false)
    }
  }
}
