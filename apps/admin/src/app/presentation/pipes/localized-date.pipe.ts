import { formatDate } from '@angular/common'
import { inject, Pipe, type PipeTransform } from '@angular/core'
import { LocaleStore } from '@presentation/navigation'

/**
 * Drop-in replacement for `DatePipe` that reads the operator's chosen language from
 * `LocaleStore` instead of the app's static bootstrap `LOCALE_ID`.
 *
 * `LOCALE_ID` is resolved once at bootstrap (`app.config.ts`) and does not change when the
 * operator switches language afterwards — Angular's built-in `DatePipe` would keep formatting
 * dates in whichever locale was active on first render. Reading `LocaleStore.locale()` inside
 * `transform` makes this pipe a signal consumer of the store: Angular's template reactivity
 * tracks that read the same way it tracks any other signal read during rendering, so every
 * `{{ x | localizedDate }}` in the app re-renders on a language switch with no page reload.
 */
@Pipe({ name: 'localizedDate' })
export class LocalizedDatePipe implements PipeTransform {
  private readonly localeStore = inject(LocaleStore)

  transform(
    value: Date | string | number | null | undefined,
    format = 'mediumDate',
  ): string | null {
    if (value === null || value === undefined || value === '') return null

    return formatDate(value, format, this.localeStore.locale())
  }
}
