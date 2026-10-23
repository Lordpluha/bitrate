import { inject, Pipe, type PipeTransform } from '@angular/core'
import { LocaleStore } from '@presentation/navigation'

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS
/** Under this, a wait reads in hours ("47 hr"); from it on, in days ("2 days"). */
const DAYS_FROM_MS = 2 * DAY_MS

/**
 * How long ago `from` was, in one compact unit — "12 min", "6 hr", "3 days" — in the given language.
 * Queues care about how long something has waited, not when; the unit labels come from `Intl`,
 * so Ukrainian reads "6 год" with no dictionary of its own.
 */
export function formatElapsed(from: Date, now: Date, locale: string): string {
  const elapsed = Math.max(now.getTime() - from.getTime(), 0)
  const [unit, size] =
    elapsed < HOUR_MS
      ? (['minute', MINUTE_MS] as const)
      : elapsed < DAYS_FROM_MS
        ? (['hour', HOUR_MS] as const)
        : (['day', DAY_MS] as const)
  const value = Math.max(Math.floor(elapsed / size), 1)
  return new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay: 'short' }).format(value)
}

/** `{{ report.createdAt | elapsed }}` — `formatElapsed` against the render time. */
@Pipe({ name: 'elapsed' })
export class ElapsedPipe implements PipeTransform {
  private readonly localeStore = inject(LocaleStore)

  transform(value: Date | null | undefined): string | null {
    if (!value) return null
    return formatElapsed(value, new Date(), this.localeStore.locale())
  }
}
