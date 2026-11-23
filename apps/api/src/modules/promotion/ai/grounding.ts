/**
 * Grounding checks for generated promotion text (spec AC-5). Generated copy may only state
 * facts that are in the generation context: anything below that the context does not contain
 * is reported, and the caller regenerates once before surfacing an error.
 */

export type UngroundedKind = 'number' | 'year' | 'rank' | 'url' | 'email' | 'handle' | 'achievement'

export interface UngroundedClaim {
  kind: UngroundedKind
  /** The text as it appears in the generated copy. */
  value: string
}

/**
 * Counts below this are wording, not claims ("a 15-second hook", "three channel hosts", the
 * day of a month), so only larger numbers must come from the context.
 */
const SMALL_NUMBER_LIMIT = 100

/** Achievement words a model tends to invent; each must appear in the context to be used. */
const ACHIEVEMENT_PATTERNS: readonly RegExp[] = [
  /\bchart(?:ed|ing|-topping)\b/giu,
  /\baward-winning\b|\bawards?\b/giu,
  /\bnominat\w*/giu,
  /\bgrammys?\b/giu,
  /\b(?:gold|platinum)\b/giu,
  /\bsold[- ]out\b/giu,
  /\bbillboard\b/giu,
  /\bnumber one\b|\bno\.\s?1\b/giu,
  /\bviral\b/giu,
]

const URL =
  /\bhttps?:\/\/[^\s)]+|\bwww\.[^\s)]+|\b[a-z0-9-]+\.(?:com|net|org|io|me|fm|app|ua|pl|eu)\b(?:\/[^\s)]*)?/giu
const EMAIL = /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/gu
const HANDLE = /(?<![\w@])@[\p{L}\p{N}_.]{2,}/gu
const RANK = /#\s?\d+\b|\btop\s+\d+\b/giu
const YEAR = /\b(?:19|20)\d{2}\b/gu
/** A number with an optional scale or percent; separators normalised before comparing. */
const NUMBER =
  /\b\d[\d,.\s]*\d\b(?:\s?(?:%|k\b|m\b|thousand|million|billion))?|\b\d(?:\s?(?:%|k\b|m\b|thousand|million|billion))?/giu

const normalise = (value: string) => value.toLowerCase().replace(/[\s,]/gu, '')

/** Reports every claim in `text` that `facts` (the generation context) does not contain. */
export function findUngroundedClaims(text: string, facts: readonly string[]): UngroundedClaim[] {
  const haystack = facts.join('\n').toLowerCase()
  const normalisedHaystack = normalise(haystack)
  const found: UngroundedClaim[] = []
  const seen = new Set<string>()
  const report = (kind: UngroundedKind, value: string) => {
    const key = `${kind}:${value.toLowerCase()}`
    if (seen.has(key)) return
    seen.add(key)
    found.push({ kind, value })
  }
  const inContext = (value: string) =>
    haystack.includes(value.toLowerCase()) || normalisedHaystack.includes(normalise(value))

  // Order matters: emails and links contain dots and digits that are not separate claims.
  let rest = text
  for (const [kind, pattern] of [
    ['email', EMAIL],
    ['url', URL],
    ['handle', HANDLE],
    ['rank', RANK],
  ] as const) {
    rest = rest.replace(pattern, (match) => {
      if (!inContext(match)) report(kind, match)
      return ' '
    })
  }
  rest = rest.replace(YEAR, (match) => {
    if (!inContext(match)) report('year', match)
    return ' '
  })
  for (const match of rest.matchAll(NUMBER)) {
    const value = match[0].trim()
    const digits = Number(value.replace(/[^\d.]/gu, ''))
    const scaled = /%|k\b|m\b|thousand|million|billion/iu.test(value)
    if (!scaled && digits < SMALL_NUMBER_LIMIT) continue
    if (!inContext(value)) report('number', value)
  }
  for (const pattern of ACHIEVEMENT_PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      if (!inContext(match[0])) report('achievement', match[0])
    }
  }
  return found
}
