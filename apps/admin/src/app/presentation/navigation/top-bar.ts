import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { TranslocoPipe } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideSearch } from '@ng-icons/lucide'
import { CommandPaletteLauncher } from './command-palette-launcher'
import { CurrentCrumb } from './current-crumb'
import { AppProfileMenu } from './profile-menu'

/** ⌘ on Apple keyboards, Ctrl everywhere else — the hint should name the key under the hand. */
export function shortcutHint(platform: string): string {
  return /mac|iphone|ipad/i.test(platform) ? '⌘K' : 'Ctrl K'
}

/**
 * The desktop top bar: the search in the centre (it opens the command palette) and, on the
 * right, the status island — where the operator is, then their avatar and its menu. The bell the
 * design shows waits for a notifications backend (ADR-0051), so it is not drawn here.
 */
@Component({
  selector: 'app-top-bar',
  imports: [AppProfileMenu, NgIcon, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideSearch })],
  /* No host box: the bar must be a direct child of the page column for `sticky` to hold. */
  host: { class: 'contents' },
  templateUrl: './top-bar.html',
})
export class AppTopBar {
  private readonly palette = inject(CommandPaletteLauncher)

  protected readonly crumb = inject(CurrentCrumb).key
  protected readonly hint = shortcutHint(globalThis.navigator?.platform ?? '')

  protected openPalette(): void {
    this.palette.open()
  }
}
