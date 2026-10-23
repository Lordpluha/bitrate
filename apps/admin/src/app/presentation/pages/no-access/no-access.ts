import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { Router } from '@angular/router'
import { RestoreSessionUseCase, SessionStore, SignOutUseCase } from '@application/session'
import { TranslocoPipe } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideLock, lucideLogOut, lucideRefreshCw } from '@ng-icons/lucide'
import { KvRow } from '@presentation/components'
import { HlmButtonImports } from '@spartan-ng/helm/button'

/**
 * Where `requirePermission` sends an operator who cannot reach any of the guarded screens.
 * Gated only by `requireStaffSession` — never by a permission — so it can never itself be the
 * target of another redirect loop. "Check again" re-reads the session and retries the guarded
 * root, so a role granted meanwhile takes effect without signing out.
 */
@Component({
  selector: 'app-no-access',
  imports: [HlmButtonImports, KvRow, NgIcon, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideLock, lucideLogOut, lucideRefreshCw })],
  templateUrl: './no-access.html',
})
export class NoAccessPage {
  private readonly router = inject(Router)
  private readonly restoreSession = inject(RestoreSessionUseCase)
  private readonly signOutUseCase = inject(SignOutUseCase)

  protected readonly staff = inject(SessionStore).currentStaff
  protected readonly checking = signal(false)

  protected async checkAgain(): Promise<void> {
    if (this.checking()) return
    this.checking.set(true)
    try {
      await this.restoreSession.execute()
      await this.router.navigate(['/'])
    } finally {
      this.checking.set(false)
    }
  }

  protected async signOut(): Promise<void> {
    await this.signOutUseCase.execute()
    await this.router.navigate(['/login'])
  }
}
