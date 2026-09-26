import { join } from 'node:path'
import { AcceptLanguageResolver, type I18nOptions, QueryResolver } from 'nestjs-i18n'
import { FALLBACK_LOCALE } from './supported-locales'

/**
 * `I18nModule.forRoot()` options. Dictionaries live beside this file, one folder per locale —
 * `apps/api/src/i18n/{en,uk}/*.json`. `watch: true` only matters in `start:dev`; it is a no-op
 * once compiled.
 */
export const i18nOptions: I18nOptions = {
  fallbackLanguage: FALLBACK_LOCALE,
  loaderOptions: {
    path: join(__dirname),
    watch: process.env.NODE_ENV !== 'production',
  },
  resolvers: [AcceptLanguageResolver, new QueryResolver(['lang'])],
}
