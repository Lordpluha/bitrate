import { type EnvironmentProviders, importProvidersFrom } from '@angular/core'
import { TranslocoTestingModule } from '@jsverse/transloco'
import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat'
import en from '../../public/assets/i18n/en.json'
import uk from '../../public/assets/i18n/uk.json'

/**
 * Transloco for a spec, with the console's real dictionaries and the same ICU messageformat
 * transpiler the app uses — so a screen's spec asserts the copy an operator actually reads
 * (plurals included) instead of a hand-made fixture that can drift from en.json.
 *
 * Both languages are preloaded; `lang` picks the active one.
 */
export function provideTestTransloco(lang: 'en' | 'uk' = 'en'): EnvironmentProviders[] {
  return [
    importProvidersFrom(
      TranslocoTestingModule.forRoot({
        langs: { en, uk },
        translocoConfig: { availableLangs: ['en', 'uk'], defaultLang: lang },
        preloadLangs: true,
      }),
    ),
    provideTranslocoMessageformat(),
  ]
}
