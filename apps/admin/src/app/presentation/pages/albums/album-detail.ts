import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { GetAlbumUseCase, RestoreAlbumUseCase, TakeDownAlbumUseCase } from '@application/albums'
import { SessionStore } from '@application/session'
import { type AlbumDetail, canRestoreAlbum, canTakeDownAlbum } from '@domain/album'
import { TAKE_DOWN_REASON_MAX_LENGTH } from '@domain/shared'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import {
  lucideArrowRight,
  lucideCheck,
  lucideDisc3,
  lucideList,
  lucideRotateCcw,
  lucideX,
} from '@ng-icons/lucide'
import { KvRow, PageHeader, Skeleton, StateMessage, Tile, TileGrid } from '@presentation/components'
import { LocaleStore } from '@presentation/navigation'
import { PIPELINE_BADGE, PIPELINE_KEY } from '@presentation/pages/catalog/catalog-labels'
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
import { ALBUM_TYPE_KEY } from './album-labels'

/** The write the open dialog will perform. */
type PendingAction = 'take-down' | 'restore'

const LOAD_ERROR = 'album.error.load'

@Component({
  selector: 'app-album-detail',
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
      lucideDisc3,
      lucideList,
      lucideRotateCcw,
      lucideX,
    }),
  ],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './album-detail.html',
})
export class AlbumDetailPage {
  private readonly route = inject(ActivatedRoute)
  private readonly getAlbum = inject(GetAlbumUseCase)
  private readonly takeDownAlbum = inject(TakeDownAlbumUseCase)
  private readonly restoreAlbum = inject(RestoreAlbumUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  private readonly session = inject(SessionStore)
  protected readonly canTakeDown = this.session.can('albums:delete')
  protected readonly canRestore = this.session.can('albums:restore')
  protected readonly albumId = this.route.snapshot.paramMap.get('id') ?? ''
  protected readonly reasonMaxLength = TAKE_DOWN_REASON_MAX_LENGTH
  protected readonly typeKey = ALBUM_TYPE_KEY
  protected readonly pipelineBadge = PIPELINE_BADGE
  protected readonly pipelineKey = PIPELINE_KEY

  private readonly record = createDetailResource({
    load: () => this.getAlbum.execute(this.albumId),
    errorMessage: LOAD_ERROR,
  })
  private readonly action = createConfirmAction<PendingAction, AlbumDetail>({
    record: this.record.value,
    failure: this.record.failure,
    reload: this.record.reload,
    isStale: isStaleStateError,
    perform: (write) => this.perform(write),
    describe: (error, { pending, record }) => {
      const notice = resourceWriteError({
        error,
        action: pending === 'take-down' ? 'take down' : 'restore',
        label: `“${record.title}”`,
        resource: 'album',
      })
      return this.t(notice.key, notice.params)
    },
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

  protected readonly back = computed(() => ({ link: '/albums', label: this.t('albums.title') }))
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
      return this.t('album.done.takeDown', { title: album.title })
    }
    await this.restoreAlbum.execute({ album, reason })
    return this.t('album.done.restore', { title: album.title })
  }

  private t(key: string, params: Record<string, string | number> = {}): string {
    return this.transloco.translate(key, params, this.locale())
  }
}
