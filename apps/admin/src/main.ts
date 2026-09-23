import { registerLocaleData } from '@angular/common'
import localeUk from '@angular/common/locales/uk'
import { bootstrapApplication } from '@angular/platform-browser'
import { appConfig } from './app/app.config'
import { App } from './app/app'

/**
 * English needs no registration — it is Angular's built-in default locale data. `uk` does, or
 * every `Intl`/`DatePipe`/`DecimalPipe` call made with a `uk-UA` locale throws
 * `NG0701: Missing locale data for the locale "uk-UA"` the first time an operator switches.
 */
registerLocaleData(localeUk, 'uk')

bootstrapApplication(App, appConfig).catch((err) => console.error(err))
