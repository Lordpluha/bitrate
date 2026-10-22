import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { TranslocoService } from '@jsverse/transloco'
import { SessionStore } from '@application/session'
import {
  DeactivateUserUseCase,
  GetUserUseCase,
  RestoreUserUseCase,
  RevokeUserSessionsUseCase,
} from '@application/users'
import {
  canDeactivateUser,
  canRestoreUser,
  canRevokeUserSessions,
  type UserDetail,
} from '@domain/user'
import { ConfirmAction } from '@presentation/components'
import {
  isStaleStateError,
  resourceWriteError,
  type Notice,
} from '@presentation/pages/shared/resource-write-error.message'
import { createDetailResource } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { ListeningHistory } from './listening-history'

/** The one action armed at a time — at most one confirm panel is ever open. */
type ArmedAction = 'deactivate' | 'restore' | 'revoke-sessions' | null

/**
 * Over 100 lines: three related take-down actions (deactivate/restore/revoke-sessions) share
 * load state, an armed-confirm state and failure reporting on one operator record — the same
 * justification `staff-detail.ts` gives for its own size.
 */
@Component({
  selector: 'app-user-detail',
  imports: [RouterLink, ConfirmAction, ListeningHistory, HlmBadgeImports, HlmButtonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-detail.html',
})
export class UserDetailPage {
  private readonly transloco = inject(TranslocoService)
  private readonly route = inject(ActivatedRoute)
  private readonly getUser = inject(GetUserUseCase)
  private readonly deactivateUser = inject(DeactivateUserUseCase)
  private readonly restoreUser = inject(RestoreUserUseCase)
  private readonly revokeSessionsUseCase = inject(RevokeUserSessionsUseCase)

  protected readonly canDeactivate = inject(SessionStore).can('users:delete')
  protected readonly canRestore = inject(SessionStore).can('users:restore')
  protected readonly canRevokeSessions = inject(SessionStore).can('users:revoke-sessions')
  protected readonly userId = this.route.snapshot.paramMap.get('id') ?? ''

  private readonly record = createDetailResource({
    load: () => this.getUser.execute(this.userId),
    errorMessage: 'Could not load this listener.',
  })

  protected readonly user = this.record.value
  protected readonly loading = this.record.loading
  protected readonly notFound = this.record.notFound
  protected readonly failure = this.record.failure
  protected readonly status = signal<string | null>(null)
  protected readonly armed = signal<ArmedAction>(null)
  protected readonly pending = signal(false)

  constructor() {
    void this.record.reload()
  }

  protected deactivation(user: UserDetail) {
    return canDeactivateUser(user)
  }

  protected restoration(user: UserDetail) {
    return canRestoreUser(user)
  }

  protected revocation(user: UserDetail) {
    return canRevokeUserSessions(user)
  }

  protected arm(action: ArmedAction): void {
    this.armed.set(action)
    this.failure.set(null)
    this.status.set(null)
  }

  protected async confirm(reason: string | undefined): Promise<void> {
    const current = this.user()
    const action = this.armed()
    if (!current || !action) return

    this.pending.set(true)
    this.failure.set(null)
    try {
      if (action === 'deactivate') {
        await this.deactivateUser.execute({ user: current, reason })
        this.status.set(`${current.username} was deactivated.`)
      } else if (action === 'restore') {
        await this.restoreUser.execute({ user: current, reason })
        this.status.set(`${current.username} was restored.`)
      } else {
        const revoked = await this.revokeSessionsUseCase.execute({ user: current, reason })
        this.status.set(
          `Revoked ${revoked} session${revoked === 1 ? '' : 's'} for ${current.username}.`,
        )
      }
      await this.record.reload()
    } catch (error) {
      this.failure.set(
        this.say(
          resourceWriteError({
            error,
            action: toWriteAction(action),
            label: current.username,
          }),
        ),
      )
      if (isStaleStateError(error)) await this.record.reload()
    } finally {
      this.pending.set(false)
      this.armed.set(null)
    }
  }

  /** A write failure in the active language; shown until the operator acts again. */
  private say(notice: Notice): string {
    return this.transloco.translate(notice.key, notice.params ?? {})
  }
}

function toWriteAction(
  action: Exclude<ArmedAction, null>,
): 'deactivate' | 'restore' | 'revoke sessions for' {
  return action === 'revoke-sessions' ? 'revoke sessions for' : action
}
