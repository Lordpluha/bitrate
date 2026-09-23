import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import { translateSignal } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideLanguages } from '@ng-icons/lucide'
import { type AppLocale, LocaleStore } from './locale-store'

/**
 * Language *endonyms* — each language's own name for itself — never go through transloco: a
 * language picker conventionally shows "English"/"Українська" regardless of which language is
 * currently active, the same way a phone's language settings do.
 */
const LOCALE_LABEL: Record<AppLocale, string> = {
  en: 'English',
  uk: 'Українська',
}

/**
 * Cycles the operator's interface language from a single row in the sidebar footer, sharing its
 * silhouette with `AppThemeToggle` beside it — same shape, a different preference. One button
 * rather than a picker: today there are only two languages, and this reads the same in both
 * sidebar states.
 *
 * `ariaLabel` interpolates the endonym into one `locale.ariaLabel` key with `translateSignal`
 * rather than concatenating two fragments in JS — the surrounding sentence still needs to
 * reorder per language even though the label itself never translates.
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
  protected readonly ariaLabel = translateSignal(
    'locale.ariaLabel',
    computed(() => ({ label: this.label() })),
  )

  protected cycle(): void {
    this.store.cycle()
  }
}
