import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http'
import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core'
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router'
import { authInterceptor, provideAdminInfrastructure } from '@infrastructure'
import { routes } from './app.routes'

/**
 * The composition root. This file and `infrastructure.providers.ts` are the only places allowed
 * to see every layer at once — the dependency rule holds because nothing else does.
 *
 * No change-detection provider on purpose: this app was scaffolded zoneless, ships no `zone.js`,
 * and Angular 22 needs no opt-in for that. Do not add `provideZoneChangeDetection`.
 *
 * No query-cache provider either — reads go straight to the API (ADR-0035).
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ anchorScrolling: 'enabled' }),
    ),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideAdminInfrastructure(),
  ],
}
