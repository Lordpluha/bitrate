import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { GetAlbumUseCase, RestoreAlbumUseCase, TakeDownAlbumUseCase } from '@application/albums'
import { SessionStore } from '@application/session'
import { type AlbumDetail, canRestoreAlbum, canTakeDownAlbum } from '@domain/album'
import { TAKE_DOWN_REASON_MAX_LENGTH } from '@domain/shared'
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

/** The write the open dialog will perform. */
type PendingAction = 'take-down' | 'restore'

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
  protected readonly reasonMaxLength = TAKE_DOWN_REASON_MAX_LENGTH

  private readonly record = createDetailResource({
    load: () => this.getAlbum.execute(this.albumId),
    errorMessage: 'Could not load this album.',
  })
  private readonly action = createConfirmAction<PendingAction, AlbumDetail>({
    record: this.record.value,
    failure: this.record.failure,
    reload: this.record.reload,
    isStale: isStaleStateError,
    perform: (write) => this.perform(write),
    describe: (error, { pending, record }) =>
      resourceWriteErrorMessage({
        error,
        action: pending === 'take-down' ? 'take down' : 'restore',
        label: `"${record.title}"`,
        resource: 'album',
      }),
  })

  protected readonly album = this.record.value
  protected readonly loading = this.record.loading
  protected readonly notFound = this.record.notFound
  protected readonly failure = this.record.failure
  protected readonly status = this.action.status
  protected readonly pendingAction = this.action.pending
  protected readonly reason = this.action.reason
  protected readonly working = this.action.working
  protected readonly ask = this.action.arm
  protected readonly cancel = this.action.cancel
  protected readonly confirm = this.action.confirm

  constructor() {
    void this.record.reload()
  }

  protected takeDownable(album: AlbumDetail): boolean {
    return canTakeDownAlbum(album).allowed
  }

  protected restorable(album: AlbumDetail): boolean {
    return canRestoreAlbum(album).allowed
  }

  private async perform({
    pending,
    record: album,
    reason,
  }: ConfirmedWrite<PendingAction, AlbumDetail>): Promise<string> {
    if (pending === 'take-down') {
      await this.takeDownAlbum.execute({ album, reason })
      return `"${album.title}" was taken down. Its tracks were not changed.`
    }
    await this.restoreAlbum.execute({ album, reason })
    return `"${album.title}" was restored.`
  }
}
