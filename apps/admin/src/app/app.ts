import { Component, inject } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { SessionStore } from '@application/session'
import {
  AppMobileBars,
  AppSidebar,
  AppTopBar,
  CommandPaletteLauncher,
} from '@presentation/navigation'

/**
 * The shell, after pencil/web-admin-design: on desktop a floating glass sidebar beside a column
 * with the top bar (centred search, status island with the profile menu) over the page; on phones
 * a glass top bar and an island tab bar. Signed out, only the outlet renders — the login card
 * stands alone on the aurora.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppMobileBars, AppSidebar, AppTopBar],
  host: { '(document:keydown)': 'onKeydown($event)' },
  templateUrl: './app.html',
})
export class App {
  private readonly palette = inject(CommandPaletteLauncher)

  protected readonly staff = inject(SessionStore).currentStaff

  /** ⌘K / Ctrl K opens the command palette from anywhere in the console; pressed again, closes it. */
  protected onKeydown(event: KeyboardEvent): void {
    if (!this.staff()) return
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      this.palette.toggle()
    }
  }
}
