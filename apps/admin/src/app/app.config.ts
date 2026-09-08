import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http'
import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core'
import { provideRouter, withComponentInputBinding } from '@angular/router'
import { authInterceptor } from '@shared/api'
import { routes } from './app.routes'

/**
 * No change-detection provider on purpose: this app was scaffolded zoneless, ships no `zone.js`,
 * and Angular 22 needs no opt-in for that. Do not add `provideZoneChangeDetection`.
 *
 * No query-cache provider either — reads go straight to the API (ADR-0035).
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
  ],
}
