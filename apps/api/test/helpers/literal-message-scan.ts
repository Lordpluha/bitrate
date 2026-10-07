/**
 * Finds user-facing English literals in API source, so every message can become a dictionary
 * key (`errors.*` / `validation.*`) that the `HttpExceptionFilter` translates.
 *
 * Parsed with the TypeScript compiler API (syntax only, no type-checker). Flagged:
 *
 *  (a) `new <Name>(...)` of an HttpException subclass — a name ending in `Exception`, or a class
 *      declared in an `errors/` folder that extends an exception (see {@link collectErrorClassNames}) —
 *      whose first argument is a string literal, a template literal (substituted or not), or an
 *      object literal with a literal `message`. `throw` is not required.
 *  (b) `super(<same shapes>)` inside a class whose `extends` clause names such an exception.
 *  (c) a literal `message:` property in a zod schema option object: files importing `zod`, or
 *      files under `dtos/` / named `*.dto.ts` / `*schema*.ts`.
 *
 * A text starting with `errors.` or `validation.` is a key and never flagged; so is any argument
 * that is not a literal (an identifier, a constant, `UNAUTHORIZED_ERRORS.X`, a call, a string
 * concatenation) — that is a known limitation: such messages are not checked at all.
 *
 * The result feeds the per-file ratchet in `test/i18n-literal-baseline.json`.
 */
import ts from 'typescript'

/** One offending literal, positioned 1-based. */
export type LiteralMessage = { file: string; line: number; column: number; text: string }

/** A dictionary key rather than prose. */
const KEY_PATTERN = /^(errors|validation)\./

/** Names that are HttpException subclasses by convention. */
const EXCEPTION_NAME = /Exception$/

/** DTO and schema files, where `message:` is a validation message. */
const DTO_FILE = /(?:^|\/)(?:dtos?|[^/]*\.dtos?|[^/]*schemas?)(?:\/|\.ts$)/i

/** Specs, fixtures, mocks and the dictionaries are not user-facing source. */
const SKIPPED_FILE = /(?:spec|__tests__|__mocks__|\/fixtures?\/|^src\/i18n\/)/

/** True when `file` (a `src/...` path relative to the API root) is production source. */
export function isScannedSourceFile(file: string): boolean {
  return file.endsWith('.ts') && !SKIPPED_FILE.test(file)
}

/** Parses TypeScript source without type information. */
const parse = (file: string, source: string): ts.SourceFile =>
  ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)

/** The identifier name an `extends` / `new` expression ends in (`a.B` gives `B`). */
function lastName(expression: ts.Expression): string | undefined {
  if (ts.isIdentifier(expression)) return expression.text
  if (ts.isPropertyAccessExpression(expression)) return expression.name.text
  return undefined
}

/** The name a class extends, if any. */
function extendedName(node: ts.ClassLikeDeclaration): string | undefined {
  const clause = node.heritageClauses?.find((c) => c.token === ts.SyntaxKind.ExtendsKeyword)
  const base = clause?.types[0]?.expression
  return base ? lastName(base) : undefined
}

/**
 * Names of classes declared in an `errors/` folder that extend an exception (directly or via
 * another such class) — the `...Error` classes `new X('…')` cannot be recognised by name alone.
 * Collect these across the whole tree first and pass them to {@link findLiteralMessages}.
 */
export function collectErrorClassNames(file: string, source: string): Set<string> {
  const names = new Set<string>()
  if (!/(?:^|\/)errors\//.test(file)) return names
  const visit = (node: ts.Node) => {
    if (ts.isClassDeclaration(node) && node.name) {
      const base = extendedName(node)
      if (base && EXCEPTION_NAME.test(base)) names.add(node.name.text)
    }
    ts.forEachChild(node, visit)
  }
  visit(parse(file, source))
  return names
}

/** The literal node of a message-carrying argument, if it is one. */
function literalOf(node: ts.Expression | undefined): ts.Node | undefined {
  if (!node) return undefined
  if (
    ts.isStringLiteral(node) ||
    ts.isNoSubstitutionTemplateLiteral(node) ||
    ts.isTemplateExpression(node)
  ) {
    return node
  }
  if (ts.isObjectLiteralExpression(node)) {
    for (const property of node.properties) {
      if (
        ts.isPropertyAssignment(property) &&
        (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) &&
        property.name.text === 'message'
      ) {
        return literalOf(property.initializer)
      }
    }
  }
  return undefined
}

/** The literal's text without its quotes (a template keeps its `${…}` source). */
function textOf(node: ts.Node, sourceFile: ts.SourceFile): string {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  return node.getText(sourceFile).slice(1, -1)
}

/**
 * Every non-key literal message in one source file, in source order. `knownErrorClasses` is the
 * tree-wide result of {@link collectErrorClassNames}.
 */
export function findLiteralMessages(
  file: string,
  source: string,
  knownErrorClasses: ReadonlySet<string> = new Set(),
): LiteralMessage[] {
  const sourceFile = parse(file, source)
  const zodFile = DTO_FILE.test(file) || /from ['"]zod['"]/.test(source)
  const isException = (name: string | undefined): boolean =>
    name !== undefined && (EXCEPTION_NAME.test(name) || knownErrorClasses.has(name))
  const flagged = new Map<number, ts.Node>()

  const flag = (node: ts.Node | undefined) => {
    if (node && !KEY_PATTERN.test(textOf(node, sourceFile)))
      flagged.set(node.getStart(sourceFile), node)
  }

  const visit = (node: ts.Node) => {
    if (ts.isNewExpression(node) && isException(lastName(node.expression))) {
      flag(literalOf(node.arguments?.[0]))
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.SuperKeyword) {
      let owner: ts.Node | undefined = node.parent
      while (owner && !ts.isClassLike(owner)) owner = owner.parent
      if (owner && isException(extendedName(owner as ts.ClassLikeDeclaration))) {
        flag(literalOf(node.arguments[0]))
      }
    } else if (
      zodFile &&
      ts.isPropertyAssignment(node) &&
      (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) &&
      node.name.text === 'message'
    ) {
      const initializer = node.initializer
      if (
        ts.isStringLiteral(initializer) ||
        ts.isNoSubstitutionTemplateLiteral(initializer) ||
        ts.isTemplateExpression(initializer)
      ) {
        flag(initializer)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)

  return [...flagged.entries()]
    .sort(([a], [b]) => a - b)
    .map(([start, node]) => {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(start)
      return { file, line: line + 1, column: character + 1, text: textOf(node, sourceFile) }
    })
}

/** Counts literals per file, sorted by path — the baseline's shape (no message text). */
export function buildBaseline(found: LiteralMessage[]): Record<string, number> {
  const counts = new Map<string, number>()
  for (const { file } of found) counts.set(file, (counts.get(file) ?? 0) + 1)
  return Object.fromEntries([...counts].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
}

/**
 * The per-file ratchet. A file with more literals than its baseline (absent means 0) fails and
 * lists each literal as `file:line:column — text`; a file with fewer fails too and asks for the
 * baseline to be lowered. Returns one problem string per offending file; empty means pass.
 */
export function checkBaseline(found: LiteralMessage[], baseline: Record<string, number>): string[] {
  const byFile = new Map<string, LiteralMessage[]>()
  for (const item of found) byFile.set(item.file, [...(byFile.get(item.file) ?? []), item])
  const problems: string[] = []

  for (const file of [...new Set([...byFile.keys(), ...Object.keys(baseline)])].sort()) {
    const items = byFile.get(file) ?? []
    const allowed = baseline[file] ?? 0
    if (items.length > allowed) {
      const lines = items.map((i) => `    ${i.file}:${i.line}:${i.column} — ${i.text}`)
      problems.push(
        `${file} has ${items.length} literal message(s), baseline ${allowed}. Use a dictionary key (errors.* / validation.*) instead:\n${lines.join('\n')}`,
      )
    } else if (items.length < allowed) {
      problems.push(
        `${file} improved: lower its baseline in test/i18n-literal-baseline.json from ${allowed} to ${items.length}${items.length === 0 ? ' (delete the entry)' : ''}.`,
      )
    }
  }
  return problems
}
