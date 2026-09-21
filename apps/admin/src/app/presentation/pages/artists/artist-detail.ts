import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
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
import { ConfirmAction } from '@presentation/components'
import {
  isStaleStateError,
  resourceWriteErrorMessage,
} from '@presentation/pages/shared/resource-write-error.message'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { ArtistAlbums } from './artist-albums'
import { ArtistTracks } from './artist-tracks'

/** The one action armed at a time — at most one confirm panel is ever open. */
type ArmedAction = 'deactivate' | 'restore' | 'revoke-sessions' | null

/**
 * Over 100 lines: four related actions (verify, deactivate/restore, revoke-sessions) share load
 * state, an armed-confirm state and failure reporting on one operator record — the same
 * justification `staff-detail.ts` gives for its own size.
 */
@Component({
  selector: 'app-artist-detail',
  imports: [
    RouterLink,
    ConfirmAction,
    ArtistTracks,
    ArtistAlbums,
    HlmBadgeImports,
    HlmButtonImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './artist-detail.html',
})
export class ArtistDetailPage {
  private readonly route = inject(ActivatedRoute)
  private readonly getArtist = inject(GetArtistUseCase)
  private readonly deactivateArtist = inject(DeactivateArtistUseCase)
  private readonly restoreArtist = inject(RestoreArtistUseCase)
  private readonly revokeSessionsUseCase = inject(RevokeArtistSessionsUseCase)
  private readonly toggleVerificationUseCase = inject(ToggleArtistVerificationUseCase)

  protected readonly canVerify = inject(SessionStore).can('artists:verify')
  protected readonly canDeactivate = inject(SessionStore).can('artists:delete')
  protected readonly canRestore = inject(SessionStore).can('artists:restore')
  protected readonly canRevokeSessions = inject(SessionStore).can('artists:revoke-sessions')
  protected readonly artistId = this.route.snapshot.paramMap.get('id') ?? ''

  protected readonly artist = signal<ArtistDetail | null>(null)
  protected readonly loading = signal(true)
  protected readonly notFound = signal(false)
  protected readonly failure = signal<string | null>(null)
  protected readonly status = signal<string | null>(null)
  protected readonly armed = signal<ArmedAction>(null)
  protected readonly pending = signal(false)
  protected readonly verifying = signal(false)

  constructor() {
    void this.load()
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
    this.failure.set(null)
    try {
      await this.toggleVerificationUseCase.execute(current)
      await this.load()
    } catch (error) {
      this.failure.set(
        resourceWriteErrorMessage({ error, action: 'deactivate', label: current.username }),
      )
    } finally {
      this.verifying.set(false)
    }
  }

  protected arm(action: ArmedAction): void {
    this.armed.set(action)
    this.failure.set(null)
    this.status.set(null)
  }

  protected async confirm(reason: string | undefined): Promise<void> {
    const current = this.artist()
    const action = this.armed()
    if (!current || !action) return

    this.pending.set(true)
    this.failure.set(null)
    try {
      if (action === 'deactivate') {
        await this.deactivateArtist.execute({ artist: current, reason })
        this.status.set(`${current.username} was deactivated.`)
      } else if (action === 'restore') {
        await this.restoreArtist.execute({ artist: current, reason })
        this.status.set(`${current.username} was restored.`)
      } else {
        const revoked = await this.revokeSessionsUseCase.execute({ artist: current, reason })
        this.status.set(
          `Revoked ${revoked} session${revoked === 1 ? '' : 's'} for ${current.username}.`,
        )
      }
      await this.load()
    } catch (error) {
      this.failure.set(
        resourceWriteErrorMessage({
          error,
          action: toWriteAction(action),
          label: current.username,
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
      this.artist.set(await this.getArtist.execute(this.artistId))
      this.notFound.set(false)
    } catch {
      this.notFound.set(true)
    } finally {
      this.loading.set(false)
    }
  }
}

function toWriteAction(
  action: Exclude<ArmedAction, null>,
): 'deactivate' | 'restore' | 'revoke sessions for' {
  return action === 'revoke-sessions' ? 'revoke sessions for' : action
}
