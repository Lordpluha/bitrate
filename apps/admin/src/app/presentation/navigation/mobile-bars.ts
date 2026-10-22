import { Dialog, type DialogRef } from '@angular/cdk/dialog'
import { Overlay } from '@angular/cdk/overlay'
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { SessionStore } from '@application/session'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideLayoutDashboard, lucideMenu, lucideSearch } from '@ng-icons/lucide'
import { CommandPaletteLauncher } from './command-palette-launcher'
import { AppMenuSheet } from './menu-sheet'
import { AppProfileMenu } from './profile-menu'

/**
 * The phone shell, below the `lg` breakpoint: a glass top bar with the brand and the avatar, and
 * an island tab bar fixed to the bottom — Overview, Search, Menu. Every action lives once: search
 * and the menu are only in the tab bar, the profile only behind the avatar. The Alerts tab the
 * design shows waits for a notifications backend (ADR-0051).
 */
@Component({
  selector: 'app-mobile-bars',
  imports: [AppProfileMenu, NgIcon, RouterLink, RouterLinkActive, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideLayoutDashboard, lucideMenu, lucideSearch })],
  /* No host box: the top bar must be a direct child of the page column for `sticky` to hold. */
  host: { class: 'contents' },
  templateUrl: './mobile-bars.html',
})
export class AppMobileBars {
  private readonly dialog = inject(Dialog)
  private readonly overlay = inject(Overlay)
  private readonly transloco = inject(TranslocoService)
  private readonly palette = inject(CommandPaletteLauncher)
  private readonly session = inject(SessionStore)
  private sheet: DialogRef<unknown, AppMenuSheet> | null = null

  protected readonly canOverview = this.session.can('overview:read')
  protected readonly menuOpen = signal(false)

  protected openPalette(): void {
    this.palette.open()
  }

  protected toggleMenu(): void {
    if (this.sheet) {
      this.sheet.close()
      return
    }
    this.sheet = this.dialog.open(AppMenuSheet, {
      ariaLabel: this.transloco.translate('shell.tabs.menu'),
      backdropClass: ['bg-background/50', 'backdrop-blur-[6px]'],
      positionStrategy: this.overlay.position().global().bottom('0').centerHorizontally(),
      width: '100%',
      autoFocus: 'first-tabbable',
      restoreFocus: true,
    })
    this.menuOpen.set(true)
    this.sheet.closed.subscribe(() => {
      this.sheet = null
      this.menuOpen.set(false)
    })
  }
}
