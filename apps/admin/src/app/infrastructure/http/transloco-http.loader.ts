import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import type { Translation, TranslocoLoader } from '@jsverse/transloco'
import type { Observable } from 'rxjs'

/**
 * Fetches `public/assets/i18n/<lang>.json` — served at `/assets/i18n/<lang>.json` per
 * `angular.json`'s `public` asset glob. A plain `HttpClient` adapter, same shape as every other
 * HTTP adapter in `infrastructure/` — it just resolves a dictionary instead of a domain entity.
 */
@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient)

  getTranslation(lang: string): Observable<Translation> {
    return this.http.get<Translation>(`/assets/i18n/${lang}.json`)
  }
}
