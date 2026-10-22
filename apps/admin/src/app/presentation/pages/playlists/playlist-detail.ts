import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core'
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
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import {
  lucideArrowRight,
  lucideCheck,
  lucideEye,
  lucideEyeOff,
  lucideList,
  lucideListMusic,
  lucideRotateCcw,
  lucideX,
} from '@ng-icons/lucide'
import { KvRow, PageHeader, Skeleton, StateMessage, Tile, TileGrid } from '@presentation/components'
import { LocaleStore } from '@presentation/navigation'
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

/** The write the open dialog will perform. */
type PendingAction = 'hide' | 'unhide' | 'take-down' | 'restore'

/** What each confirm dialog says, as keys; the action is the only thing the template switches on. */
const DIALOG_COPY = {
  hide: {
    title: 'playlist.dialog.hideTitle',
    body: 'playlist.dialog.hideDesc',
    confirm: 'playlist.dialog.hideAction',
    destructive: true,
  },
  unhide: {
    title: 'playlist.dialog.unhideTitle',
    body: 'playlist.dialog.unhideDesc',
    confirm: 'playlist.dialog.unhideAction',
    destructive: false,
  },
  'take-down': {
    title: 'playlist.dialog.takeDownTitle',
    body: 'playlist.dialog.takeDownDesc',
    confirm: 'content.yesTakeDown',
    destructive: true,
  },
  restore: {
    title: 'playlist.dialog.restoreTitle',
    body: 'playlist.dialog.restoreDesc',
    confirm: 'content.yesRestore',
    destructive: false,
  },
} as const satisfies Record<
  PendingAction,
  { title: string; body: string; confirm: string; destructive: boolean }
>

const DONE_KEY: Record<PendingAction, string> = {
  hide: 'playlist.done.hide',
  unhide: 'playlist.done.unhide',
  'take-down': 'playlist.done.takeDown',
  restore: 'playlist.done.restore',
}

const LOAD_ERROR = 'playlist.error.load'

@Component({
  selector: 'app-playlist-detail',
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
      lucideEye,
      lucideEyeOff,
      lucideList,
      lucideListMusic,
      lucideRotateCcw,
      lucideX,
    }),
  ],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './playlist-detail.html',
})
export class PlaylistDetailPage {
  private readonly route = inject(ActivatedRoute)
  private readonly getPlaylist = inject(GetPlaylistUseCase)
  private readonly setVisibility = inject(SetPlaylistVisibilityUseCase)
  private readonly takeDownPlaylist = inject(TakeDownPlaylistUseCase)
  private readonly restorePlaylist = inject(RestorePlaylistUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  private readonly session = inject(SessionStore)
  protected readonly canHideOrUnhide = this.session.can('playlists:hide')
  protected readonly canTakeDown = this.session.can('playlists:delete')
  protected readonly canRestore = this.session.can('playlists:restore')
  protected readonly playlistId = this.route.snapshot.paramMap.get('id') ?? ''
  protected readonly reasonMaxLength = TAKE_DOWN_REASON_MAX_LENGTH
  protected readonly dialogCopy = DIALOG_COPY

  private readonly record = createDetailResource({
    load: () => this.getPlaylist.execute(this.playlistId),
    errorMessage: LOAD_ERROR,
  })
  private readonly action = createConfirmAction<PendingAction, PlaylistDetail>({
    record: this.record.value,
    failure: this.record.failure,
    reload: this.record.reload,
    isStale: isStaleStateError,
    perform: (write) => this.perform(write),
    describe: (error, { pending, record }) => {
      const notice = resourceWriteError({
        error,
        action: pending === 'take-down' ? 'take down' : pending,
        label: `“${record.title}”`,
        resource: 'playlist',
      })
      return this.t(notice.key, notice.params)
    },
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

  protected readonly back = computed(() => ({
    link: '/playlists',
    label: this.t('playlists.title'),
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
        break
      case 'unhide':
        await this.setVisibility.execute({ playlist, isPublic: true, reason })
        break
      case 'take-down':
        await this.takeDownPlaylist.execute({ playlist, reason })
        break
      case 'restore':
        await this.restorePlaylist.execute({ playlist, reason })
        break
    }
    return this.t(DONE_KEY[pending], { title: playlist.title })
  }

  private t(key: string, params: Record<string, string | number> = {}): string {
    return this.transloco.translate(key, params, this.locale())
  }
}
