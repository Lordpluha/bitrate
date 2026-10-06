import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { GetAlbumUseCase, RestoreAlbumUseCase, TakeDownAlbumUseCase } from '@application/albums'
import { SessionStore } from '@application/session'
import { type AlbumDetail, canRestoreAlbum, canTakeDownAlbum } from '@domain/album'
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

/** Mirrors the API's `TakeDownReasonSchema` limit. */
const REASON_MAX_LENGTH = 500

/** The write the open dialog will perform; `null` while it is closed. */
type PendingAction = 'take-down' | 'restore' | null

/**
 * Over 100 lines: load state, the confirm dialog's armed state and failure reporting share one
 * operator record — the same justification `track-detail.ts` gives for its own size.
 */
@Component({
  selector: 'app-album-detail',
  imports: [
    LocalizedDatePipe,
    RouterLink,
    HlmBadgeImports,
    HlmButtonImports,
    HlmDialogImports,
    HlmLabelImports,
    HlmTableImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './album-detail.html',
})
export class AlbumDetailPage {
  private readonly route = inject(ActivatedRoute)
  private readonly getAlbum = inject(GetAlbumUseCase)
  private readonly takeDownAlbum = inject(TakeDownAlbumUseCase)
  private readonly restoreAlbum = inject(RestoreAlbumUseCase)

  private readonly session = inject(SessionStore)
  protected readonly canTakeDown = this.session.can('albums:delete')
  protected readonly canRestore = this.session.can('albums:restore')
  protected readonly albumId = this.route.snapshot.paramMap.get('id') ?? ''
  protected readonly reasonMaxLength = REASON_MAX_LENGTH

  protected readonly album = signal<AlbumDetail | null>(null)
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

  protected takeDownable(album: AlbumDetail): boolean {
    return canTakeDownAlbum(album).allowed
  }

  protected restorable(album: AlbumDetail): boolean {
    return canRestoreAlbum(album).allowed
  }

  protected ask(action: PendingAction): void {
    this.reason.set('')
    this.failure.set(null)
    this.status.set(null)
    this.pendingAction.set(action)
  }

  /** Closing mid-write is ignored so the dialog cannot vanish under an in-flight request. */
  protected cancel(): void {
    if (!this.working()) this.pendingAction.set(null)
  }

  protected async confirm(): Promise<void> {
    const current = this.album()
    const action = this.pendingAction()
    if (!current || !action || this.working()) return

    const reason = this.reason().trim() || undefined
    this.working.set(true)
    this.failure.set(null)
    try {
      if (action === 'take-down') {
        await this.takeDownAlbum.execute({ album: current, reason })
        this.status.set(`"${current.title}" was taken down. Its tracks were not changed.`)
      } else {
        await this.restoreAlbum.execute({ album: current, reason })
        this.status.set(`"${current.title}" was restored.`)
      }
      await this.load()
    } catch (error) {
      this.failure.set(
        resourceWriteErrorMessage({
          error,
          action: action === 'take-down' ? 'take down' : 'restore',
          label: `"${current.title}"`,
          resource: 'album',
        }),
      )
      if (isStaleStateError(error)) await this.load()
    } finally {
      this.working.set(false)
      this.pendingAction.set(null)
    }
  }

  private async load(): Promise<void> {
    this.loading.set(true)
    try {
      this.album.set(await this.getAlbum.execute(this.albumId))
      this.notFound.set(false)
    } catch {
      this.notFound.set(true)
    } finally {
      this.loading.set(false)
    }
  }
}
