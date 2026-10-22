import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
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
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import {
  lucideActivity,
  lucideArrowRight,
  lucideCheck,
  lucideHistory,
  lucideLogOut,
  lucideRotateCcw,
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
import { ListeningHistory } from './listening-history'

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
 * Over 100 lines: three related take-down actions (deactivate/restore/revoke-sessions) share
 * load state, an armed-confirm state and failure reporting on one operator record — the same
 * justification `staff-detail.ts` gives for its own size.
 */
@Component({
  selector: 'app-user-detail',
  imports: [
    ConfirmAction,
    HlmBadgeImports,
    HlmButtonImports,
    KvRow,
    ListeningHistory,
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
      lucideCheck,
      lucideHistory,
      lucideLogOut,
      lucideRotateCcw,
      lucideX,
    }),
  ],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './user-detail.html',
})
export class UserDetailPage {
  private readonly route = inject(ActivatedRoute)
  private readonly getUser = inject(GetUserUseCase)
  private readonly deactivateUser = inject(DeactivateUserUseCase)
  private readonly restoreUser = inject(RestoreUserUseCase)
  private readonly revokeSessionsUseCase = inject(RevokeUserSessionsUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  protected readonly canDeactivate = inject(SessionStore).can('users:delete')
  protected readonly canRestore = inject(SessionStore).can('users:restore')
  protected readonly canRevokeSessions = inject(SessionStore).can('users:revoke-sessions')
  protected readonly userId = this.route.snapshot.paramMap.get('id') ?? ''
  protected readonly confirmCopy = CONFIRM

  private readonly record = createDetailResource({
    load: () => this.getUser.execute(this.userId),
    errorMessage: 'user.error.load',
  })

  protected readonly user = this.record.value
  protected readonly loading = this.record.loading
  protected readonly notFound = this.record.notFound
  protected readonly failure = this.record.failure
  /** What the last action did, or why it failed; translated on show. */
  protected readonly status = signal<Notice | null>(null)
  protected readonly actionError = signal<Notice | null>(null)
  protected readonly armed = signal<ArmedAction>(null)
  protected readonly pending = signal(false)

  protected readonly back = computed(() => ({ link: '/users', label: this.t('users.title') }))
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
    this.actionError.set(null)
    this.status.set(null)
  }

  protected async confirm(reason: string | undefined): Promise<void> {
    const current = this.user()
    const action = this.armed()
    if (!current || !action) return

    const name = current.username
    this.pending.set(true)
    this.actionError.set(null)
    try {
      if (action === 'deactivate') {
        await this.deactivateUser.execute({ user: current, reason })
        this.status.set({ key: 'account.done.deactivated', params: { name } })
      } else if (action === 'restore') {
        await this.restoreUser.execute({ user: current, reason })
        this.status.set({ key: 'account.done.restored', params: { name } })
      } else {
        const count = await this.revokeSessionsUseCase.execute({ user: current, reason })
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
