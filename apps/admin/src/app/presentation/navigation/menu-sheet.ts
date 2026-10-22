import { DialogRef } from '@angular/cdk/dialog'
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { NavigationStart, Router } from '@angular/router'
import { TranslocoPipe } from '@jsverse/transloco'
import { filter } from 'rxjs'
import { AppLocaleToggle } from './locale-toggle'
import { AppNavItem } from './nav-item'
import { AppThemeToggle } from './theme-toggle'
import { VisibleNav } from './visible-nav'

/**
 * The phone's menu: the same sections as the desktop sidebar, in a sheet that rises from the tab
 * bar, with the language and theme rows under them. Any navigation closes it — a followed link
 * has done the sheet's job; so do the backdrop, Escape and the Menu tab again.
 */
@Component({
  selector: 'app-menu-sheet',
  imports: [AppLocaleToggle, AppNavItem, AppThemeToggle, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-sheet.html',
})
export class AppMenuSheet {
  protected readonly sections = inject(VisibleNav).sections

  constructor() {
    const dialog = inject(DialogRef)
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationStart),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => dialog.close())
  }
}
