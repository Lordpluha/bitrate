import type { Locale } from '@bitrate/support-core'

/** The user's Telegram language (`uk`, `pl`, `en-GB`…) as a support locale; English otherwise. */
export function telegramLocale(languageCode: string | undefined): Locale {
  const language = languageCode?.slice(0, 2)
  return language === 'uk' || language === 'pl' ? language : 'en'
}
