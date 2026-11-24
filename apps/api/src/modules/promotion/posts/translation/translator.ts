import type { TranslationLanguage } from './translation-languages'

export interface TranslationRequest {
  artistId: string
  source: string
  language: TranslationLanguage
  /** Terms the translation must keep exactly (names, links, hashtags). */
  terms: readonly string[]
}

/**
 * Translates post text (ADR-0076). The LLM route is the default; a DeepL adapter can implement
 * the same port if the eval chooses it, without changes to the post services.
 */
export interface Translator {
  translate(request: TranslationRequest): Promise<{ text: string; model: string }>
}

export const TRANSLATOR = Symbol('TRANSLATOR')
