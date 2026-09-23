import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import { translateSignal } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideContrast, lucideMoon, lucideSun } from '@ng-icons/lucide'
import { type Theme, ThemeStore } from './theme-store'

const THEME_ICON: Record<Theme, string> = {
  dark: 'lucideMoon',
  light: 'lucideSun',
  dim: 'lucideContrast',
}

/** A `theme.*` transloco key, not display text — see `theme-toggle.html`. */
const THEME_LABEL_KEY: Record<Theme, string> = {
  dark: 'theme.dark',
  light: 'theme.light',
  dim: 'theme.dim',
}

/**
 * Cycles the operator's colour theme from a single row in the sidebar footer, sharing its
 * silhouette with the collapse control beside it. One button rather than a three-way group: a
 * segmented control does not fit the 64px collapsed rail, and this reads the same in both
 * states.
 */
@Component({
  selector: 'app-theme-toggle',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideContrast, lucideMoon, lucideSun })],
  templateUrl: './theme-toggle.html',
})
export class AppThemeToggle {
  private readonly store = inject(ThemeStore)

  readonly collapsed = input(false)

  protected readonly icon = computed(() => THEME_ICON[this.store.theme()])
  private readonly labelKey = computed(() => THEME_LABEL_KEY[this.store.theme()])
  protected readonly label = translateSignal(this.labelKey)
  protected readonly ariaLabel = translateSignal(
    'theme.ariaLabel',
    computed(() => ({ label: this.label() })),
  )

  protected cycle(): void {
    this.store.cycle()
  }
}
