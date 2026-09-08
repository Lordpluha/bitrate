import { Component, inject } from '@angular/core'
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { AuthService } from '@shared/api'
import { NAV_ITEMS } from './app.routes'
import { HlmButtonImports } from '@spartan-ng/helm/button'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, HlmButtonImports],
  templateUrl: './app.html',
})
export class App {
  private readonly auth = inject(AuthService)
  private readonly router = inject(Router)

  protected readonly navItems = NAV_ITEMS
  protected readonly staff = this.auth.currentStaff

  protected async signOut(): Promise<void> {
    await this.auth.logout()
    await this.router.navigate(['/login'])
  }
}
