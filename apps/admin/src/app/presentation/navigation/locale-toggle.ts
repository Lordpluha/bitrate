import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideLanguages } from '@ng-icons/lucide'
import { type AppLocale, LocaleStore } from './locale-store'

const LOCALE_LABEL: Record<AppLocale, string> = {
  en: 'English',
  uk: 'Українська',
}

/**
 * Cycles the operator's interface language from a single row in the sidebar footer, sharing its
 * silhouette with `AppThemeToggle` beside it — same shape, a different preference. One button
 * rather than a picker: today there are only two languages, and this reads the same in both
 * sidebar states.
 */
@Component({
  selector: 'app-locale-toggle',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideLanguages })],
  templateUrl: './locale-toggle.html',
})
export class AppLocaleToggle {
  private readonly store = inject(LocaleStore)

  readonly collapsed = input(false)

  protected readonly label = computed(() => LOCALE_LABEL[this.store.locale()])
  protected readonly ariaLabel = computed(() => `${this.label()}. Activate to switch language.`)

  protected cycle(): void {
    this.store.cycle()
  }
}
