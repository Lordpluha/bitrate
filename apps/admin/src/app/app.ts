import { Component, inject } from '@angular/core'
import { Router, RouterOutlet } from '@angular/router'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideLogOut } from '@ng-icons/lucide'
import { AuthService } from '@shared/api'
import { AppSidebar } from '@shared/navigation'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppSidebar, NgIcon, HlmBadgeImports, HlmButtonImports],
  providers: [provideIcons({ lucideLogOut })],
  templateUrl: './app.html',
})
export class App {
  private readonly auth = inject(AuthService)
  private readonly router = inject(Router)

  protected readonly staff = this.auth.currentStaff

  protected async signOut(): Promise<void> {
    await this.auth.logout()
    await this.router.navigate(['/login'])
  }
}
