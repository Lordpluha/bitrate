import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
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
import { TAKE_DOWN_REASON_MAX_LENGTH } from '@domain/shared'
import { formatMinutes } from '@presentation/pages/shared/duration.formatter'
import {
  isStaleStateError,
  resourceWriteErrorMessage,
} from '@presentation/pages/shared/resource-write-error.message'
import { LocalizedDatePipe } from '@presentation/pipes'
import { type ConfirmedWrite, createConfirmAction, createDetailResource } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmDialogImports } from '@spartan-ng/helm/dialog'
import { HlmLabelImports } from '@spartan-ng/helm/label'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { HlmTabsImports } from '@spartan-ng/helm/tabs'

/** The write the open dialog will perform, and what it targets. */
type PendingAction =
  | { kind: 'podcast'; action: 'take-down' | 'restore' }
  | { kind: 'episode'; action: 'take-down' | 'restore'; episode: PodcastEpisode }

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
  protected readonly reasonMaxLength = TAKE_DOWN_REASON_MAX_LENGTH

  private readonly record = createDetailResource({
    load: () => this.getPodcast.execute(this.podcastId),
    errorMessage: 'Could not load this podcast.',
  })
  private readonly action = createConfirmAction<PendingAction, PodcastDetail>({
    record: this.record.value,
    failure: this.record.failure,
    reload: this.record.reload,
    isStale: isStaleStateError,
    perform: (write) => this.perform(write),
    describe: (error, { pending, record }) =>
      resourceWriteErrorMessage({
        error,
        action: pending.action === 'take-down' ? 'take down' : 'restore',
        label: `"${titleOf(pending, record)}"`,
        resource: pending.kind,
      }),
  })

  protected readonly podcast = this.record.value
  protected readonly loading = this.record.loading
  protected readonly notFound = this.record.notFound
  protected readonly failure = this.record.failure
  protected readonly status = this.action.status
  protected readonly pendingAction = this.action.pending
  protected readonly reason = this.action.reason
  protected readonly working = this.action.working
  protected readonly cancel = this.action.cancel
  protected readonly confirm = this.action.confirm

  constructor() {
    void this.record.reload()
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
    return formatMinutes(episode.durationSeconds)
  }

  protected askPodcast(action: 'take-down' | 'restore'): void {
    this.action.arm({ kind: 'podcast', action })
  }

  protected askEpisode(episode: PodcastEpisode, action: 'take-down' | 'restore'): void {
    this.action.arm({ kind: 'episode', action, episode })
  }

  /** What the open dialog is about, for its title and description. */
  protected targetLabel(pending: PendingAction): string {
    return pending.kind === 'podcast' ? 'podcast' : 'episode'
  }

  protected targetTitle(pending: PendingAction): string {
    return titleOf(pending, this.podcast())
  }

  private async perform({
    pending,
    record: podcast,
    reason,
  }: ConfirmedWrite<PendingAction, PodcastDetail>): Promise<string> {
    if (pending.kind === 'podcast') {
      if (pending.action === 'take-down') {
        await this.takeDownPodcast.execute({ podcast, reason })
      } else {
        await this.restorePodcast.execute({ podcast, reason })
      }
    } else if (pending.action === 'take-down') {
      await this.takeDownEpisode.execute({ episode: pending.episode, reason })
    } else {
      await this.restoreEpisode.execute({ episode: pending.episode, reason })
    }
    return successMessage(pending, `"${titleOf(pending, podcast)}"`)
  }
}

/** The dialog target's title: the podcast's own, or the armed episode's. */
function titleOf(pending: PendingAction, podcast: PodcastDetail | null): string {
  return pending.kind === 'podcast' ? (podcast?.title ?? '') : pending.episode.title
}

function successMessage(pending: PendingAction, label: string): string {
  if (pending.action === 'restore') return `${label} was restored.`
  return pending.kind === 'podcast'
    ? `${label} was taken down. Its episodes were not changed.`
    : `${label} was taken down. The podcast and its other episodes were not changed.`
}
