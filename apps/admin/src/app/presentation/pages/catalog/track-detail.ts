import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import {
  GetTrackUseCase,
  ReprocessTrackUseCase,
  RestoreTrackUseCase,
  TakeDownTrackUseCase,
} from '@application/catalog'
import { SessionStore } from '@application/session'
import {
  canListen,
  canReprocess,
  canRestoreTrack,
  canTakeDownTrack,
  isTrackStuck,
  type TrackDetail,
} from '@domain/track'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import {
  lucideArrowRight,
  lucideAudioLines,
  lucideCheck,
  lucideDisc3,
  lucideFileAudio,
  lucideHeadphones,
  lucideHistory,
  lucideRefreshCw,
  lucideRotateCcw,
  lucideTags,
  lucideUsers,
  lucideX,
} from '@ng-icons/lucide'
import {
  ConfirmAction,
  KvRow,
  PageHeader,
  Skeleton,
  StateMessage,
  Tile,
  TileGrid,
  TrackAudioPlayer,
} from '@presentation/components'
import { LocaleStore } from '@presentation/navigation'
import {
  isStaleStateError,
  type Notice,
  resourceWriteError,
} from '@presentation/pages/shared/resource-write-error.message'
import { LocalizedDatePipe } from '@presentation/pipes'
import { createDetailResource } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { PIPELINE_BADGE, PIPELINE_KEY } from './catalog-labels'
import { ProcessingHistory } from './processing-history'

/** The one action armed at a time — at most one confirm panel is ever open. */
type ArmedAction = 'take-down' | 'restore' | null

/**
 * Over 100 lines: reprocess/take-down/restore share load state, an armed-confirm state and
 * failure reporting on one operator record — the same justification `staff-detail.ts` gives for
 * its own size.
 */
@Component({
  selector: 'app-track-detail',
  imports: [
    ConfirmAction,
    HlmBadgeImports,
    HlmButtonImports,
    KvRow,
    LocalizedDatePipe,
    NgIcon,
    PageHeader,
    ProcessingHistory,
    RouterLink,
    Skeleton,
    StateMessage,
    Tile,
    TileGrid,
    TrackAudioPlayer,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideAudioLines,
      lucideCheck,
      lucideDisc3,
      lucideFileAudio,
      lucideHeadphones,
      lucideHistory,
      lucideRefreshCw,
      lucideRotateCcw,
      lucideTags,
      lucideUsers,
      lucideX,
    }),
  ],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './track-detail.html',
})
export class TrackDetailPage {
  private readonly route = inject(ActivatedRoute)
  private readonly getTrack = inject(GetTrackUseCase)
  private readonly reprocessTrack = inject(ReprocessTrackUseCase)
  private readonly takeDownTrack = inject(TakeDownTrackUseCase)
  private readonly restoreTrack = inject(RestoreTrackUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  protected readonly canReprocessTrack = inject(SessionStore).can('tracks:reprocess')
  protected readonly canTakeDown = inject(SessionStore).can('tracks:delete')
  protected readonly canRestore = inject(SessionStore).can('tracks:restore')
  protected readonly trackId = this.route.snapshot.paramMap.get('id') ?? ''
  protected readonly pipelineBadge = PIPELINE_BADGE
  protected readonly pipelineKey = PIPELINE_KEY

  private readonly record = createDetailResource({
    load: () => this.getTrack.execute(this.trackId),
    errorMessage: 'track.error.load',
  })

  protected readonly track = this.record.value
  protected readonly loading = this.record.loading
  protected readonly notFound = this.record.notFound
  protected readonly failure = this.record.failure
  /** What the last action did, or why it failed; translated on show. */
  protected readonly status = signal<Notice | null>(null)
  protected readonly actionError = signal<Notice | null>(null)
  protected readonly armed = signal<ArmedAction>(null)
  protected readonly pending = signal(false)
  protected readonly reprocessing = signal(false)
  private readonly history = viewChild(ProcessingHistory)

  protected readonly back = computed(() => ({ link: '/catalog', label: this.t('catalog.title') }))
  protected readonly failureText = computed(() => {
    const key = this.failure()
    return key === null ? null : this.t(key)
  })
  protected readonly statusText = computed(() => this.say(this.status()))
  protected readonly actionErrorText = computed(() => this.say(this.actionError()))

  constructor() {
    void this.record.reload()
  }

  protected reload(): void {
    this.failure.set(null)
    void this.record.reload()
  }

  protected isStuck(track: TrackDetail): boolean {
    return isTrackStuck({ track })
  }

  protected reprocessible(track: TrackDetail): boolean {
    return canReprocess(track)
  }

  protected takeDownable(track: TrackDetail): boolean {
    return canTakeDownTrack(track).allowed
  }

  protected restorable(track: TrackDetail): boolean {
    return canRestoreTrack(track).allowed
  }

  protected listenable(track: TrackDetail): boolean {
    return canListen(track).allowed
  }

  /** A rendition as one line — "cmaf · 256 kbps · aac · 7.4 MB". */
  protected rendition(file: TrackDetail['audioFiles'][number]): string {
    const parts = [file.format, `${file.bitrate} kbps`]
    if (file.codec) parts.push(file.codec)
    if (file.size !== null) parts.push(`${(file.size / 1024 / 1024).toFixed(1)} MB`)
    return parts.join(' · ')
  }

  protected arm(action: ArmedAction): void {
    this.armed.set(action)
    this.actionError.set(null)
    this.status.set(null)
  }

  protected async reprocess(): Promise<void> {
    const current = this.track()
    if (!current) return

    this.reprocessing.set(true)
    this.actionError.set(null)
    this.status.set(null)
    try {
      await this.reprocessTrack.execute(current)
      this.status.set({ key: 'track.done.reprocess', params: { title: current.title } })
      await this.record.reload()
      await this.history()?.reload()
    } catch (error) {
      this.actionError.set(
        resourceWriteError({
          error,
          action: 'reprocess',
          label: `“${current.title}”`,
          resource: 'track',
        }),
      )
    } finally {
      this.reprocessing.set(false)
    }
  }

  protected async confirm(reason: string | undefined): Promise<void> {
    const current = this.track()
    const action = this.armed()
    if (!current || !action) return

    this.pending.set(true)
    this.actionError.set(null)
    try {
      if (action === 'take-down') {
        await this.takeDownTrack.execute({ track: current, reason })
        this.status.set({ key: 'track.done.takeDown', params: { title: current.title } })
      } else {
        await this.restoreTrack.execute({ track: current, reason })
        this.status.set({ key: 'track.done.restore', params: { title: current.title } })
      }
      await this.record.reload()
    } catch (error) {
      this.actionError.set(
        resourceWriteError({
          error,
          action: action === 'take-down' ? 'take down' : 'restore',
          label: `“${current.title}”`,
          resource: 'track',
        }),
      )
      if (isStaleStateError(error)) await this.record.reload()
    } finally {
      this.pending.set(false)
      this.armed.set(null)
    }
  }

  private say(notice: Notice | null): string | null {
    return notice === null ? null : this.t(notice.key, notice.params)
  }

  private t(key: string, params: Record<string, string | number> = {}): string {
    return this.transloco.translate(key, params, this.locale())
  }
}
