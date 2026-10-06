import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
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
import {
  isStaleStateError,
  resourceWriteErrorMessage,
} from '@presentation/pages/shared/resource-write-error.message'
import { LocalizedDatePipe } from '@presentation/pipes'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmDialogImports } from '@spartan-ng/helm/dialog'
import { HlmLabelImports } from '@spartan-ng/helm/label'
import { HlmTableImports } from '@spartan-ng/helm/table'

/** Mirrors the API's `TakeDownReasonSchema` limit. */
const REASON_MAX_LENGTH = 500

/** The write the open dialog will perform; `null` while it is closed. */
type PendingAction = 'hide' | 'unhide' | 'take-down' | 'restore' | null

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
  NonNullable<PendingAction>,
  { title: string; confirm: string; destructive: boolean; body: (title: string) => string }
>

/**
 * Over 100 lines: load state, the confirm dialog's armed state and failure reporting share one
 * operator record — the same justification `album-detail.ts` gives for its own size.
 */
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
  protected readonly reasonMaxLength = REASON_MAX_LENGTH
  protected readonly dialogCopy = DIALOG_COPY

  protected readonly playlist = signal<PlaylistDetail | null>(null)
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
    const current = this.playlist()
    const action = this.pendingAction()
    if (!current || !action || this.working()) return

    const reason = this.reason().trim() || undefined
    this.working.set(true)
    this.failure.set(null)
    try {
      await this.perform({ action, playlist: current, reason })
      await this.load()
    } catch (error) {
      this.failure.set(
        resourceWriteErrorMessage({
          error,
          action: action === 'take-down' ? 'take down' : action,
          label: `"${current.title}"`,
          resource: 'playlist',
        }),
      )
      if (isStaleStateError(error)) await this.load()
    } finally {
      this.working.set(false)
      this.pendingAction.set(null)
    }
  }

  private async perform({
    action,
    playlist,
    reason,
  }: {
    action: NonNullable<PendingAction>
    playlist: PlaylistDetail
    reason: string | undefined
  }): Promise<void> {
    switch (action) {
      case 'hide':
        await this.setVisibility.execute({ playlist, isPublic: false, reason })
        this.status.set(`"${playlist.title}" was hidden. It is private now, not deleted.`)
        return
      case 'unhide':
        await this.setVisibility.execute({ playlist, isPublic: true, reason })
        this.status.set(`"${playlist.title}" is public again.`)
        return
      case 'take-down':
        await this.takeDownPlaylist.execute({ playlist, reason })
        this.status.set(`"${playlist.title}" was taken down. Its visibility was not changed.`)
        return
      case 'restore':
        await this.restorePlaylist.execute({ playlist, reason })
        this.status.set(`"${playlist.title}" was restored. Its visibility was not changed.`)
        return
    }
  }

  private async load(): Promise<void> {
    this.loading.set(true)
    try {
      this.playlist.set(await this.getPlaylist.execute(this.playlistId))
      this.notFound.set(false)
    } catch {
      this.notFound.set(true)
    } finally {
      this.loading.set(false)
    }
  }
}
