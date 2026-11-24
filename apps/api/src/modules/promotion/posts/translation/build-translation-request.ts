import { LANGUAGE_NAMES, type TranslationLanguage } from './translation-languages'

export const TRANSLATION_SYSTEM_PROMPT = [
  'You translate short social media posts by a musician from English.',
  'Keep the tone, line breaks and emoji. Sound natural to a native speaker, not literal.',
  'Copy every protected term exactly as given: never translate, transliterate or decline it.',
  'Add nothing that is not in the source.',
].join('\n')

/** The prompt for one translation and the facts the grounding check may accept. */
export function buildTranslationRequest(
  source: string,
  language: TranslationLanguage,
  terms: readonly string[],
): { prompt: string; facts: string[] } {
  const prompt = [
    `Translate into ${LANGUAGE_NAMES[language]}.`,
    terms.length > 0 ? `Protected terms: ${terms.map((t) => `"${t}"`).join(', ')}.` : '',
    'Source:',
    source,
  ]
    .filter(Boolean)
    .join('\n')
  return { prompt, facts: [source, ...terms] }
}
