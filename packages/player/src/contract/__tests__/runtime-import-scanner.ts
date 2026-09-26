import ts from 'typescript'

/**
 * Specifiers a module in `src/contract/**` must never import at runtime — Svelte, `.svelte`
 * files, the `element/`/`embed/` segments, and the package's own default/element/engine
 * entries (`@bitrate/player/engine` is a temporary migration export per ADR-0039, not part
 * of the stable contract). Mirrors the `@typescript-eslint/no-restricted-imports` and
 * `no-restricted-syntax` patterns in `eslint.config.js` — this file is the spec that still
 * catches a regression if that config is accidentally weakened. See
 * `.claude/rules/player-rules.md` § "The contract stays Svelte-free".
 */
const FORBIDDEN_PATTERNS: readonly RegExp[] = [
  /^svelte(\/.*)?$/,
  /\.svelte$/,
  /(^|\/)element(\/.*)?$/,
  /(^|\/)embed(\/.*)?$/,
  /^@bitrate\/player(\/(element|engine))?$/,
]

/** Whether a module specifier would break the "no DOM, no custom-element registry" boundary. */
export function isForbiddenSpecifier(specifier: string): boolean {
  return FORBIDDEN_PATTERNS.some((pattern) => pattern.test(specifier))
}

function isDynamicImportCall(node: ts.Node): node is ts.CallExpression {
  return ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword
}

/**
 * Extracts every **runtime** (non-type-only) import/export/dynamic-import module specifier
 * from a TypeScript source file, using the real compiler AST rather than a single regex — a
 * regex over source lines missed bare `import 'svelte'`, `await import('svelte')`, and
 * required a trailing slash that a directory import (`from '../element'`, no trailing
 * segment) never has. `import type` / `export type` are walked but deliberately excluded:
 * they erase at compile time and carry no runtime dependency.
 */
export function runtimeImportSpecifiers(source: string, fileName = 'source.ts'): string[] {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  const specifiers: string[] = []

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node)) {
      const isTypeOnly = node.importClause?.isTypeOnly ?? false
      if (!isTypeOnly && ts.isStringLiteral(node.moduleSpecifier)) {
        specifiers.push(node.moduleSpecifier.text)
      }
    } else if (ts.isExportDeclaration(node)) {
      if (!node.isTypeOnly && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        specifiers.push(node.moduleSpecifier.text)
      }
    } else if (isDynamicImportCall(node)) {
      const [firstArgument] = node.arguments
      if (firstArgument && ts.isStringLiteral(firstArgument)) {
        specifiers.push(firstArgument.text)
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return specifiers
}

/** Runtime specifiers in `source` that violate the contract boundary. */
export function forbiddenRuntimeImports(source: string, fileName = 'source.ts'): string[] {
  return runtimeImportSpecifiers(source, fileName).filter(isForbiddenSpecifier)
}
