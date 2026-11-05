import { existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { parseFileByPath } from '@common/utils/parseFile'
import * as ts from 'typescript'
import { type DecoratorMap, type RouteEntry, SRC_DIR, walk } from './controller-routes'

/*
 * Static (AST-based) route decorator checks for test code only.
 * Depends on the `typescript` devDependency, so it must stay out of the `@common/swagger` barrel.
 */

/** Selector modes: how many decorators from the selector's list a route must carry. */
const SELECTOR_MODES = {
  one: (count: number) => count === 1,
} satisfies Record<string, (count: number) => boolean>

export type RouteDocumentedCheckerSelectorMode = keyof typeof SELECTOR_MODES

/** Selector: the route passes when its matching decorator count satisfies `mode`. */
export type RouteDocumentedCheckerSelector = {
  mode: RouteDocumentedCheckerSelectorMode
  decorators: DecoratorMap
}

/** Resolves an import module specifier to the directory that should be searched for its export. */
function resolveSpecifierDir(fromDir: string, specifier: string): string | undefined {
  let resolved: string | undefined
  if (specifier.startsWith('.')) {
    resolved = path.resolve(fromDir, specifier)
  } else if (specifier.startsWith('@modules/')) {
    resolved = path.join(SRC_DIR, 'modules', specifier.slice('@modules/'.length))
  } else if (specifier.startsWith('@infra/')) {
    resolved = path.join(SRC_DIR, 'infra', specifier.slice('@infra/'.length))
  } else if (specifier.startsWith('@common/')) {
    resolved = path.join(SRC_DIR, 'common', specifier.slice('@common/'.length))
  } else {
    return undefined
  }

  if (existsSync(resolved) && statSync(resolved).isDirectory()) return resolved
  if (existsSync(`${resolved}.ts`)) return path.dirname(resolved)
  return undefined
}

/** Finds the module specifier that imports `name` in the given controller source file. */
function findImportSpecifier(sourceFile: ts.SourceFile, name: string): string | undefined {
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    const clause = statement.importClause
    if (!(clause?.namedBindings && ts.isNamedImports(clause.namedBindings))) continue
    const hasName = clause.namedBindings.elements.some((element) => element.name.text === name)
    if (hasName && ts.isStringLiteral(statement.moduleSpecifier)) {
      return statement.moduleSpecifier.text
    }
  }
  return undefined
}

const hasExportModifier = (node: ts.FunctionDeclaration | ts.VariableStatement) =>
  node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false

/** Source text of the exported function/variable named `name` somewhere under `dir`. */
function findExportedDeclarationText(dir: string, name: string): string | undefined {
  const files = walk(dir, (fileName) => fileName.endsWith('.ts') && !fileName.includes('.spec.'))

  for (const file of files) {
    const sourceFile = parseFileByPath(file)
    let matchedText: string | undefined

    const visit = (node: ts.Node) => {
      if (matchedText) return
      if (ts.isFunctionDeclaration(node) && node.name?.text === name && hasExportModifier(node)) {
        matchedText = node.getText(sourceFile)
      }
      if (ts.isVariableStatement(node) && hasExportModifier(node)) {
        const declares = node.declarationList.declarations.some(
          (declaration) => ts.isIdentifier(declaration.name) && declaration.name.text === name,
        )
        if (declares) matchedText = node.getText(sourceFile)
      }
      ts.forEachChild(node, visit)
    }
    visit(sourceFile)

    if (matchedText) return matchedText
  }

  return undefined
}

/**
 * Names from `decorators` a route applies, directly or through a project decorator factory
 * whose body calls them (e.g. `ApiGetTrack()` composing `ApiOperation(...)`).
 */
function collectMatches(route: RouteEntry, decorators: DecoratorMap): string[] {
  const names = Object.keys(decorators)
  const sourceFile = parseFileByPath(route.file)
  const fromDir = path.dirname(route.file)

  return route.decoratorNames.flatMap((name) => {
    if (names.includes(name)) return [name]
    const specifier = findImportSpecifier(sourceFile, name)
    const dir = specifier && resolveSpecifierDir(fromDir, specifier)
    const text = dir && findExportedDeclarationText(dir, name)
    if (!text) return []
    return names.filter((target) => new RegExp(`\\b${target}\\s*\\(`).test(text))
  })
}

/** Builds a predicate that is true when a route satisfies every selector. */
export const createRouteDocumentedChecker =
  (selectors: RouteDocumentedCheckerSelector[]) =>
  (route: RouteEntry): boolean =>
    selectors.every(({ mode, decorators }) =>
      SELECTOR_MODES[mode](collectMatches(route, decorators).length),
    )
