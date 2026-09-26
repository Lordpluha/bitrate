import { Component, inject } from '@angular/core'
import { Router, RouterOutlet } from '@angular/router'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideLogOut } from '@ng-icons/lucide'
import { SessionStore, SignOutUseCase } from '@application/session'
import { AppSidebar } from '@presentation/navigation'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppSidebar, NgIcon, HlmBadgeImports, HlmButtonImports],
  providers: [provideIcons({ lucideLogOut })],
  templateUrl: './app.html',
})
export class App {
  private readonly signOutUseCase = inject(SignOutUseCase)
  private readonly router = inject(Router)

  protected readonly staff = inject(SessionStore).currentStaff

  protected async signOut(): Promise<void> {
    await this.signOutUseCase.execute()
    await this.router.navigate(['/login'])
  }
}
