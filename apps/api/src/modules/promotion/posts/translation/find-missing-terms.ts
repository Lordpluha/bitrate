import type { UngroundedClaim } from '../../ai/grounding'

/** Glossary terms the translation dropped or changed; each sends the model back once. */
export function findMissingTerms(translation: string, terms: readonly string[]): UngroundedClaim[] {
  return terms
    .filter((term) => !translation.includes(term))
    .map((term) => ({ kind: 'term' as const, value: term }))
}
