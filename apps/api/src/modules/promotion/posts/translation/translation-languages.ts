/** Target languages for post translations (spec D-7); English is always the master. */
export const TRANSLATION_LANGUAGES = ['uk', 'pl'] as const
export type TranslationLanguage = (typeof TRANSLATION_LANGUAGES)[number]

export const LANGUAGE_NAMES: Readonly<Record<TranslationLanguage, string>> = {
  uk: 'Ukrainian',
  pl: 'Polish',
}
