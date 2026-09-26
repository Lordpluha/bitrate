import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http'
import {
  type ApplicationConfig,
  isDevMode,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core'
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router'
import { DEFAULT_LOCALE, INTL_LOCALE_TAG, readPersistedLocale } from '@domain/locale'
import {
  authInterceptor,
  localeInterceptor,
  provideAdminInfrastructure,
  TranslocoHttpLoader,
} from '@infrastructure'
import { provideTransloco } from '@jsverse/transloco'
import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat'
import { routes } from './app.routes'

/**
 * The composition root. This file and `infrastructure.providers.ts` are the only places allowed
 * to see every layer at once — the dependency rule holds because nothing else does.
 *
 * No change-detection provider on purpose: this app was scaffolded zoneless, ships no `zone.js`,
 * and Angular 22 needs no opt-in for that. Do not add `provideZoneChangeDetection`.
 *
 * No query-cache provider either — reads go straight to the API (ADR-0035).
 *
 * `LOCALE_ID` is read synchronously from storage at bootstrap — the same `readPersistedLocale`
 * the locale interceptor uses — so the very first render already resolves `Intl`/pipe formatting
 * in the operator's remembered language. It is a static bootstrap token and does not itself
 * react to a later language switch; `LocaleStore` (`presentation/navigation/locale-store.ts`)
 * carries the reactive signal, and `LocalizedDatePipe` reads that signal explicitly so template
 * date formatting follows a runtime switch with no reload. `registerLocaleData(localeUk, 'uk')`
 * in `main.ts` is what makes the `uk` locale's formatting rules available to either path.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ anchorScrolling: 'enabled' }),
    ),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, localeInterceptor])),
    provideAdminInfrastructure(),
    { provide: LOCALE_ID, useValue: INTL_LOCALE_TAG[readPersistedLocale()] },
    provideTransloco({
      config: {
        availableLangs: ['en', 'uk'],
        defaultLang: DEFAULT_LOCALE,
        fallbackLang: DEFAULT_LOCALE,
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    provideTranslocoMessageformat(),
  ],
}
