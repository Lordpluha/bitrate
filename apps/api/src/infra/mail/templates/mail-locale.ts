/** Locales the mail templates ship in. English is the fallback for every unmapped value. */
export type MailLocale = 'en' | 'uk'

/** The default value used when a recipient has no stored preference. */
export const DEFAULT_MAIL_LOCALE: MailLocale = 'en'

/** Narrows an arbitrary stored/request locale string to a supported {@link MailLocale}. */
export function resolveMailLocale(locale: string | null | undefined): MailLocale {
  return locale === 'uk' ? 'uk' : DEFAULT_MAIL_LOCALE
}
