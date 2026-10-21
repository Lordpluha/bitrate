import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import {
  GetPlaylistUseCase,
  RestorePlaylistUseCase,
  SetPlaylistVisibilityUseCase,
  TakeDownPlaylistUseCase,
} from '@application/playlists'
import { SessionStore } from '@application/session'
import {
  canHidePlaylist,
  canRestorePlaylist,
  canTakeDownPlaylist,
  canUnhidePlaylist,
  type PlaylistDetail,
} from '@domain/playlist'
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
type PendingAction = 'hide' | 'unhide' | 'take-down' | 'restore'

/** What each confirm dialog says; the action is the only thing the template switches on. */
const DIALOG_COPY = {
  hide: {
    title: 'Hide playlist',
    confirm: 'Yes, hide',
    destructive: true,
    body: (title: string) =>
      `Hide "${title}"? It becomes private and leaves the public list. It is not deleted, and can be un-hidden.`,
  },
  unhide: {
    title: 'Un-hide playlist',
    confirm: 'Yes, un-hide',
    destructive: false,
    body: (title: string) => `Make "${title}" public again? Its take-down state is not changed.`,
  },
  'take-down': {
    title: 'Take down playlist',
    confirm: 'Yes, take down',
    destructive: true,
    body: (title: string) =>
      `Take down "${title}"? It is soft-deleted until restored. Its visibility is not changed.`,
  },
  restore: {
    title: 'Restore playlist',
    confirm: 'Yes, restore',
    destructive: false,
    body: (title: string) =>
      `Restore "${title}"? Its visibility is not changed, so a hidden playlist stays hidden.`,
  },
} as const satisfies Record<
  PendingAction,
  { title: string; confirm: string; destructive: boolean; body: (title: string) => string }
>

@Component({
  selector: 'app-playlist-detail',
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
  templateUrl: './playlist-detail.html',
})
export class PlaylistDetailPage {
  private readonly route = inject(ActivatedRoute)
  private readonly getPlaylist = inject(GetPlaylistUseCase)
  private readonly setVisibility = inject(SetPlaylistVisibilityUseCase)
  private readonly takeDownPlaylist = inject(TakeDownPlaylistUseCase)
  private readonly restorePlaylist = inject(RestorePlaylistUseCase)

  private readonly session = inject(SessionStore)
  protected readonly canHideOrUnhide = this.session.can('playlists:hide')
  protected readonly canTakeDown = this.session.can('playlists:delete')
  protected readonly canRestore = this.session.can('playlists:restore')
  protected readonly playlistId = this.route.snapshot.paramMap.get('id') ?? ''
  protected readonly reasonMaxLength = TAKE_DOWN_REASON_MAX_LENGTH
  protected readonly dialogCopy = DIALOG_COPY

  private readonly record = createDetailResource({
    load: () => this.getPlaylist.execute(this.playlistId),
    errorMessage: 'Could not load this playlist.',
  })
  private readonly action = createConfirmAction<PendingAction, PlaylistDetail>({
    record: this.record.value,
    failure: this.record.failure,
    reload: this.record.reload,
    isStale: isStaleStateError,
    perform: (write) => this.perform(write),
    describe: (error, { pending, record }) =>
      resourceWriteErrorMessage({
        error,
        action: pending === 'take-down' ? 'take down' : pending,
        label: `"${record.title}"`,
        resource: 'playlist',
      }),
  })

  protected readonly playlist = this.record.value
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

  protected hideable(playlist: PlaylistDetail): boolean {
    return canHidePlaylist(playlist).allowed
  }

  protected unhideable(playlist: PlaylistDetail): boolean {
    return canUnhidePlaylist(playlist).allowed
  }

  protected takeDownable(playlist: PlaylistDetail): boolean {
    return canTakeDownPlaylist(playlist).allowed
  }

  protected restorable(playlist: PlaylistDetail): boolean {
    return canRestorePlaylist(playlist).allowed
  }

  private async perform({
    pending,
    record: playlist,
    reason,
  }: ConfirmedWrite<PendingAction, PlaylistDetail>): Promise<string> {
    switch (pending) {
      case 'hide':
        await this.setVisibility.execute({ playlist, isPublic: false, reason })
        return `"${playlist.title}" was hidden. It is private now, not deleted.`
      case 'unhide':
        await this.setVisibility.execute({ playlist, isPublic: true, reason })
        return `"${playlist.title}" is public again.`
      case 'take-down':
        await this.takeDownPlaylist.execute({ playlist, reason })
        return `"${playlist.title}" was taken down. Its visibility was not changed.`
      case 'restore':
        await this.restorePlaylist.execute({ playlist, reason })
        return `"${playlist.title}" was restored. Its visibility was not changed.`
    }
  }
}
