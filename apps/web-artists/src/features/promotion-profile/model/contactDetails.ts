/**
 * Mirrors the API's check (`promotion/ai/contact-details.ts`): text written for AI must carry
 * no links, emails, phone numbers or @handles. The server stays the authority.
 */
const PATTERNS = [
  /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/u,
  /\bhttps?:\/\/\S+|\bwww\.\S+|\b[a-z0-9-]+\.(?:com|net|org|io|me|fm|app|ua|pl|eu)\b/iu,
  /\+?\d[\d\s().-]{7,}\d/u,
  /(?<![\w@])@[\p{L}\p{N}_.]{2,}/u,
]

export const hasContactDetails = (text: string) =>
  PATTERNS.some((pattern) => pattern.test(text))
