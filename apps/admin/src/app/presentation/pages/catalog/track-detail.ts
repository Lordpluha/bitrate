import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core'
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
import { ConfirmAction, TrackAudioPlayer } from '@presentation/components'
import {
  isStaleStateError,
  resourceWriteErrorMessage,
} from '@presentation/pages/shared/resource-write-error.message'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
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
    RouterLink,
    ConfirmAction,
    HlmBadgeImports,
    HlmButtonImports,
    ProcessingHistory,
    TrackAudioPlayer,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './track-detail.html',
})
export class TrackDetailPage {
  private readonly route = inject(ActivatedRoute)
  private readonly getTrack = inject(GetTrackUseCase)
  private readonly reprocessTrack = inject(ReprocessTrackUseCase)
  private readonly takeDownTrack = inject(TakeDownTrackUseCase)
  private readonly restoreTrack = inject(RestoreTrackUseCase)

  protected readonly canReprocessTrack = inject(SessionStore).can('tracks:reprocess')
  protected readonly canTakeDown = inject(SessionStore).can('tracks:delete')
  protected readonly canRestore = inject(SessionStore).can('tracks:restore')
  protected readonly trackId = this.route.snapshot.paramMap.get('id') ?? ''

  protected readonly track = signal<TrackDetail | null>(null)
  protected readonly loading = signal(true)
  protected readonly notFound = signal(false)
  protected readonly failure = signal<string | null>(null)
  protected readonly status = signal<string | null>(null)
  protected readonly armed = signal<ArmedAction>(null)
  protected readonly pending = signal(false)
  protected readonly reprocessing = signal(false)
  private readonly history = viewChild(ProcessingHistory)

  protected isStuck(track: TrackDetail): boolean {
    return isTrackStuck({ track })
  }

  constructor() {
    void this.load()
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

  protected arm(action: ArmedAction): void {
    this.armed.set(action)
    this.failure.set(null)
    this.status.set(null)
  }

  protected async reprocess(): Promise<void> {
    const current = this.track()
    if (!current) return

    this.reprocessing.set(true)
    this.failure.set(null)
    try {
      await this.reprocessTrack.execute(current)
      this.status.set(`"${current.title}" was queued for reprocessing.`)
      await this.load()
      await this.history()?.reload()
    } catch (error) {
      this.failure.set(
        resourceWriteErrorMessage({
          error,
          action: 'reprocess',
          label: `"${current.title}"`,
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
    this.failure.set(null)
    try {
      if (action === 'take-down') {
        await this.takeDownTrack.execute({ track: current, reason })
        this.status.set(`"${current.title}" was taken down.`)
      } else {
        await this.restoreTrack.execute({ track: current, reason })
        this.status.set(`"${current.title}" was restored.`)
      }
      await this.load()
    } catch (error) {
      this.failure.set(
        resourceWriteErrorMessage({
          error,
          action: action === 'take-down' ? 'take down' : 'restore',
          label: `"${current.title}"`,
          resource: 'track',
        }),
      )
      if (isStaleStateError(error)) await this.load()
    } finally {
      this.pending.set(false)
      this.armed.set(null)
    }
  }

  private async load(): Promise<void> {
    this.loading.set(true)
    try {
      this.track.set(await this.getTrack.execute(this.trackId))
      this.notFound.set(false)
    } catch {
      this.notFound.set(true)
    } finally {
      this.loading.set(false)
    }
  }
}
