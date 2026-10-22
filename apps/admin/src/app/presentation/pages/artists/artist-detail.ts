import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import {
  DeactivateArtistUseCase,
  GetArtistUseCase,
  RestoreArtistUseCase,
  RevokeArtistSessionsUseCase,
  ToggleArtistVerificationUseCase,
} from '@application/artists'
import { SessionStore } from '@application/session'
import {
  canChangeVerification,
  canDeactivateArtist,
  canRestoreArtist,
  canRevokeArtistSessions,
  type ArtistDetail,
} from '@domain/artist'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import {
  lucideActivity,
  lucideArrowRight,
  lucideAudioLines,
  lucideBadgeCheck,
  lucideCheck,
  lucideDisc3,
  lucideLogOut,
  lucideRotateCcw,
  lucideUser,
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
import { ArtistAlbums } from './artist-albums'
import { ArtistTracks } from './artist-tracks'

/** The one action armed at a time — at most one confirm panel is ever open. */
type ArmedAction = 'deactivate' | 'restore' | 'revoke-sessions' | null

const CONFIRM: Record<Exclude<ArmedAction, null>, { body: string; action: string }> = {
  deactivate: { body: 'account.confirm.deactivate', action: 'account.confirm.deactivateAction' },
  restore: { body: 'account.confirm.restore', action: 'account.confirm.restoreAction' },
  'revoke-sessions': {
    body: 'account.confirm.revokeSessions',
    action: 'account.confirm.revokeSessionsAction',
  },
}

/**
 * Over 100 lines: four related actions (verify, deactivate/restore, revoke-sessions) share load
 * state, an armed-confirm state and failure reporting on one operator record — the same
 * justification `staff-detail.ts` gives for its own size.
 */
@Component({
  selector: 'app-artist-detail',
  imports: [
    ArtistAlbums,
    ArtistTracks,
    ConfirmAction,
    HlmBadgeImports,
    HlmButtonImports,
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
      lucideActivity,
      lucideArrowRight,
      lucideAudioLines,
      lucideBadgeCheck,
      lucideCheck,
      lucideDisc3,
      lucideLogOut,
      lucideRotateCcw,
      lucideUser,
      lucideX,
    }),
  ],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './artist-detail.html',
})
export class ArtistDetailPage {
  private readonly route = inject(ActivatedRoute)
  private readonly getArtist = inject(GetArtistUseCase)
  private readonly deactivateArtist = inject(DeactivateArtistUseCase)
  private readonly restoreArtist = inject(RestoreArtistUseCase)
  private readonly revokeSessionsUseCase = inject(RevokeArtistSessionsUseCase)
  private readonly toggleVerificationUseCase = inject(ToggleArtistVerificationUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  protected readonly canVerify = inject(SessionStore).can('artists:verify')
  protected readonly canDeactivate = inject(SessionStore).can('artists:delete')
  protected readonly canRestore = inject(SessionStore).can('artists:restore')
  protected readonly canRevokeSessions = inject(SessionStore).can('artists:revoke-sessions')
  protected readonly artistId = this.route.snapshot.paramMap.get('id') ?? ''
  protected readonly confirmCopy = CONFIRM

  private readonly record = createDetailResource({
    load: () => this.getArtist.execute(this.artistId),
    errorMessage: 'artist.error.load',
  })

  protected readonly artist = this.record.value
  protected readonly loading = this.record.loading
  protected readonly notFound = this.record.notFound
  protected readonly failure = this.record.failure
  /** What the last action did, or why it failed; translated on show. */
  protected readonly status = signal<Notice | null>(null)
  protected readonly actionError = signal<Notice | null>(null)
  protected readonly armed = signal<ArmedAction>(null)
  protected readonly pending = signal(false)
  protected readonly verifying = signal(false)

  protected readonly back = computed(() => ({ link: '/artists', label: this.t('artists.title') }))
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

  protected deactivation(artist: ArtistDetail) {
    return canDeactivateArtist(artist)
  }

  protected restoration(artist: ArtistDetail) {
    return canRestoreArtist(artist)
  }

  protected revocation(artist: ArtistDetail) {
    return canRevokeArtistSessions(artist)
  }

  protected verifiable(artist: ArtistDetail): boolean {
    return canChangeVerification(artist).allowed
  }

  protected async toggleVerification(): Promise<void> {
    const current = this.artist()
    if (!current) return

    this.verifying.set(true)
    this.actionError.set(null)
    this.status.set(null)
    try {
      await this.toggleVerificationUseCase.execute(current)
      await this.record.reload()
    } catch {
      this.actionError.set({ key: 'artist.error.verify', params: { name: current.username } })
    } finally {
      this.verifying.set(false)
    }
  }

  protected arm(action: ArmedAction): void {
    this.armed.set(action)
    this.actionError.set(null)
    this.status.set(null)
  }

  protected async confirm(reason: string | undefined): Promise<void> {
    const current = this.artist()
    const action = this.armed()
    if (!current || !action) return

    const name = current.username
    this.pending.set(true)
    this.actionError.set(null)
    try {
      if (action === 'deactivate') {
        await this.deactivateArtist.execute({ artist: current, reason })
        this.status.set({ key: 'account.done.deactivated', params: { name } })
      } else if (action === 'restore') {
        await this.restoreArtist.execute({ artist: current, reason })
        this.status.set({ key: 'account.done.restored', params: { name } })
      } else {
        const count = await this.revokeSessionsUseCase.execute({ artist: current, reason })
        this.status.set({ key: 'account.done.revokedSessions', params: { name, count } })
      }
      await this.record.reload()
    } catch (error) {
      this.actionError.set(
        resourceWriteError({ error, action: toWriteAction(action), label: name }),
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

function toWriteAction(
  action: Exclude<ArmedAction, null>,
): 'deactivate' | 'restore' | 'revoke sessions for' {
  return action === 'revoke-sessions' ? 'revoke sessions for' : action
}
