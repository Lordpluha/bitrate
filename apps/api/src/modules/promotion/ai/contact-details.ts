/**
 * Artist-written examples and hints are sent to a model, so they must carry no contact details
 * (spec D-16, ADR-0076: minimal data). This runs before any model call and before the cheap
 * moderation task.
 */

export type ContactDetailKind = 'url' | 'email' | 'phone' | 'handle'

const PATTERNS: ReadonlyArray<readonly [ContactDetailKind, RegExp]> = [
  ['email', /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/u],
  ['url', /\bhttps?:\/\/\S+|\bwww\.\S+|\b[a-z0-9-]+\.(?:com|net|org|io|me|fm|app|ua|pl|eu)\b/iu],
  ['phone', /\+?\d[\d\s().-]{7,}\d/u],
  ['handle', /(?<![\w@])@[\p{L}\p{N}_.]{2,}/u],
]

/** The kinds of contact detail found in `text`, in a stable order; empty when there are none. */
export function findContactDetails(text: string): ContactDetailKind[] {
  let rest = text
  const kinds: ContactDetailKind[] = []
  for (const [kind, pattern] of PATTERNS) {
    if (pattern.test(rest)) {
      kinds.push(kind)
      rest = rest.replace(new RegExp(pattern.source, `${pattern.flags}g`), ' ')
    }
  }
  return kinds
}
