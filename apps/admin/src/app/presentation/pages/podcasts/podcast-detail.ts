import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core'
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
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import {
  lucideArrowRight,
  lucideCheck,
  lucideList,
  lucidePodcast,
  lucideRotateCcw,
  lucideX,
} from '@ng-icons/lucide'
import { KvRow, PageHeader, Skeleton, StateMessage, Tile, TileGrid } from '@presentation/components'
import { LocaleStore } from '@presentation/navigation'
import { wholeMinutes } from '@presentation/pages/shared/duration.formatter'
import {
  isStaleStateError,
  resourceWriteError,
} from '@presentation/pages/shared/resource-write-error.message'
import { LocalizedDatePipe } from '@presentation/pipes'
import { type ConfirmedWrite, createConfirmAction, createDetailResource } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmDialogImports } from '@spartan-ng/helm/dialog'
import { HlmLabelImports } from '@spartan-ng/helm/label'
import { HlmTableImports } from '@spartan-ng/helm/table'

/** The write the open dialog will perform, and what it targets. */
type PendingAction =
  | { kind: 'podcast'; action: 'take-down' | 'restore' }
  | { kind: 'episode'; action: 'take-down' | 'restore'; episode: PodcastEpisode }

/** The dialog's title and body keys, by target and action. */
const DIALOG_KEY = {
  podcast: {
    'take-down': { title: 'podcast.dialog.takeDownTitle', body: 'podcast.dialog.takeDownDesc' },
    restore: { title: 'podcast.dialog.restoreTitle', body: 'podcast.dialog.restoreDesc' },
  },
  episode: {
    'take-down': {
      title: 'podcast.dialog.episodeTakeDownTitle',
      body: 'podcast.dialog.episodeTakeDownDesc',
    },
    restore: {
      title: 'podcast.dialog.episodeRestoreTitle',
      body: 'podcast.dialog.episodeRestoreDesc',
    },
  },
} as const

const LOAD_ERROR = 'podcast.error.load'

@Component({
  selector: 'app-podcast-detail',
  imports: [
    HlmBadgeImports,
    HlmButtonImports,
    HlmDialogImports,
    HlmLabelImports,
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
      lucideCheck,
      lucideList,
      lucidePodcast,
      lucideRotateCcw,
      lucideX,
    }),
  ],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './podcast-detail.html',
})
export class PodcastDetailPage {
  private readonly route = inject(ActivatedRoute)
  private readonly getPodcast = inject(GetPodcastUseCase)
  private readonly takeDownPodcast = inject(TakeDownPodcastUseCase)
  private readonly restorePodcast = inject(RestorePodcastUseCase)
  private readonly takeDownEpisode = inject(TakeDownPodcastEpisodeUseCase)
  private readonly restoreEpisode = inject(RestorePodcastEpisodeUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  private readonly session = inject(SessionStore)
  /** Episodes reuse the podcast permissions — there are no separate episode grants. */
  protected readonly canTakeDown = this.session.can('podcasts:delete')
  protected readonly canRestore = this.session.can('podcasts:restore')
  protected readonly podcastId = this.route.snapshot.paramMap.get('id') ?? ''
  protected readonly reasonMaxLength = TAKE_DOWN_REASON_MAX_LENGTH
  protected readonly dialogKey = DIALOG_KEY

  private readonly record = createDetailResource({
    load: () => this.getPodcast.execute(this.podcastId),
    errorMessage: LOAD_ERROR,
  })
  private readonly action = createConfirmAction<PendingAction, PodcastDetail>({
    record: this.record.value,
    failure: this.record.failure,
    reload: this.record.reload,
    isStale: isStaleStateError,
    perform: (write) => this.perform(write),
    describe: (error, { pending, record }) => {
      const notice = resourceWriteError({
        error,
        action: pending.action === 'take-down' ? 'take down' : 'restore',
        label: `“${titleOf(pending, record)}”`,
        resource: pending.kind,
      })
      return this.t(notice.key, notice.params)
    },
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

  protected readonly back = computed(() => ({
    link: '/podcasts',
    label: this.t('podcasts.title'),
  }))
  /** The load failure is a key; a failed write is already in the operator's language. */
  protected readonly failureText = computed(() => {
    const failure = this.failure()
    return failure === LOAD_ERROR ? this.t(failure) : failure
  })

  constructor() {
    void this.record.reload()
  }

  protected reload(): void {
    this.failure.set(null)
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

  protected minutes(episode: PodcastEpisode): number | null {
    return wholeMinutes(episode.durationSeconds)
  }

  protected askPodcast(action: 'take-down' | 'restore'): void {
    this.action.arm({ kind: 'podcast', action })
  }

  protected askEpisode(episode: PodcastEpisode, action: 'take-down' | 'restore'): void {
    this.action.arm({ kind: 'episode', action, episode })
  }

  protected targetTitle(pending: PendingAction): string {
    return titleOf(pending, this.podcast())
  }

  private async perform({
    pending,
    record: podcast,
    reason,
  }: ConfirmedWrite<PendingAction, PodcastDetail>): Promise<string> {
    const title = titleOf(pending, podcast)
    if (pending.kind === 'podcast') {
      if (pending.action === 'take-down') {
        await this.takeDownPodcast.execute({ podcast, reason })
        return this.t('podcast.done.takeDown', { title })
      }
      await this.restorePodcast.execute({ podcast, reason })
    } else if (pending.action === 'take-down') {
      await this.takeDownEpisode.execute({ episode: pending.episode, reason })
      return this.t('podcast.done.episodeTakeDown', { title })
    } else {
      await this.restoreEpisode.execute({ episode: pending.episode, reason })
    }
    return this.t('podcast.done.restore', { title })
  }

  private t(key: string, params: Record<string, string | number> = {}): string {
    return this.transloco.translate(key, params, this.locale())
  }
}

/** The dialog target's title: the podcast's own, or the armed episode's. */
function titleOf(pending: PendingAction, podcast: PodcastDetail | null): string {
  return pending.kind === 'podcast' ? (podcast?.title ?? '') : pending.episode.title
}
