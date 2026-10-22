import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { TranslocoPipe } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucidePanelLeft } from '@ng-icons/lucide'
import { AppLocaleToggle } from './locale-toggle'
import { AppNavItem } from './nav-item'
import { SIDEBAR_EXPANDED, SIDEBAR_RAIL, SidebarState } from './sidebar-state'
import { AppThemeToggle } from './theme-toggle'
import { VisibleNav } from './visible-nav'

/**
 * The floating glass sidebar (desktop): brand, the sections the operator may open, and the
 * language, theme and fold controls. Folded, it becomes a 76px icon rail; phones get the menu
 * sheet instead (`AppMobileBars`).
 *
 * It sticks one screen tall while the page scrolls under it, like the prototype's panel — the
 * footer stays in reach on long lists.
 */
@Component({
  selector: 'app-sidebar',
  imports: [AppLocaleToggle, AppNavItem, AppThemeToggle, NgIcon, RouterLink, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucidePanelLeft })],
  /**
   * The host box is removed so the `<aside>` becomes the shell's flex item directly, which is what
   * lets its `shrink-0` and sticky height apply. Safe here because `<app-sidebar>` carries no role
   * of its own; `display: contents` only causes trouble on elements whose semantics would be
   * dropped with the box.
   */
  host: { class: 'contents' },
  templateUrl: './app-sidebar.html',
})
export class AppSidebar {
  private readonly sidebar = inject(SidebarState)

  protected readonly sections = inject(VisibleNav).sections
  protected readonly collapsed = this.sidebar.collapsed
  protected readonly expandedWidth = SIDEBAR_EXPANDED
  protected readonly railWidth = SIDEBAR_RAIL

  protected toggle(): void {
    this.sidebar.toggle()
  }
}
