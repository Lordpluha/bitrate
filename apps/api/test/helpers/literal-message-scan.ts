/**
 * Finds user-facing English literals in API source: the text of a `throw new <X>Exception(...)`
 * and a literal `message:` in a DTO/schema file. Every message must be a dictionary key
 * (`errors.*` / `validation.*`) so the `HttpExceptionFilter` can translate it; the guard spec
 * fails on anything not on `test/i18n-literal-allowlist.json`.
 */

/** One offending literal and the file it sits in. */
export type LiteralMessage = { file: string; text: string }

/** A dictionary key rather than prose. */
const KEY_PATTERN = /^(errors|validation)\./

/** A string/template literal body: group 1 = quote, group 2 = text. */
const LITERAL = String.raw`(['"\`])((?:\\.|(?!\1)[^\\])*)\1`

/** `throw new XException('text'` / `throw new XException(\n "text"`. */
const THROW_LITERAL = new RegExp(String.raw`throw\s+new\s+\w*Exception\(\s*${LITERAL}`, 'g')
/** `throw new XException({ …, message: 'text'` — the object form, up to the first closing brace. */
const THROW_OBJECT_LITERAL = new RegExp(
  String.raw`throw\s+new\s+\w*Exception\(\s*\{[^}]*?\bmessage:\s*${LITERAL}`,
  'g',
)
/** `message: 'text'` — zod `{ message }` options and schema messages. */
const MESSAGE_LITERAL = new RegExp(String.raw`\bmessage:\s*${LITERAL}`, 'g')

/** DTO and schema files (or any zod user), where `message:` is a validation message rather than a response field. */
const DTO_FILE = /(?:^|\/)(?:dtos?|[^/]*\.dtos?|[^/]*schemas?)(?:\/|\.ts$)/i

/** A file that builds zod schemas, wherever it lives. */
const ZOD_IMPORT = /from ['"]zod['"]/

/** Specs, fixtures, mocks and the dictionaries themselves are not user-facing source. */
const SKIPPED_FILE = /(?:spec|__tests__|__mocks__|\/fixtures?\/|^src\/i18n\/)/

/** True when `file` (a `src/...` path relative to the API root) is production source. */
export function isScannedSourceFile(file: string): boolean {
  return file.endsWith('.ts') && !SKIPPED_FILE.test(file)
}

/** Collects the literal body (capture group 2; group 1 is the quote) of every match. */
function collect(pattern: RegExp, source: string): { index: number; text: string }[] {
  return [...source.matchAll(pattern)].map((match) => ({
    index: match.index ?? 0,
    text: match[2] ?? '',
  }))
}

/** Every non-key literal message in one source file, in source order, without duplicates by position. */
export function findLiteralMessages(file: string, source: string): LiteralMessage[] {
  const hits = [
    ...collect(THROW_LITERAL, source),
    ...collect(THROW_OBJECT_LITERAL, source),
    ...(DTO_FILE.test(file) || ZOD_IMPORT.test(source) ? collect(MESSAGE_LITERAL, source) : []),
  ]
  return hits
    .sort((a, b) => a.index - b.index)
    .filter((hit) => !KEY_PATTERN.test(hit.text))
    .map((hit) => ({ file, text: hit.text }))
}

/** Counts literals per `file::text` entry — the allowlist's shape. */
export function tallyLiterals(found: LiteralMessage[]): Record<string, number> {
  const tally: Record<string, number> = {}
  for (const { file, text } of found) {
    const entry = `${file}::${text}`
    tally[entry] = (tally[entry] ?? 0) + 1
  }
  return tally
}
