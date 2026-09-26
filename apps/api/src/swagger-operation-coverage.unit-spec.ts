import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from '@jest/globals'
import * as ts from 'typescript'

/** Root of the API's own source tree — this spec's own directory. */
const SRC_DIR = __dirname

/** NestJS route-method decorator names — a method carrying one of these is an HTTP route. */
const HTTP_METHOD_DECORATORS = new Set([
  'Get',
  'Post',
  'Put',
  'Patch',
  'Delete',
  'Head',
  'Options',
  'All',
])

/** Decorator names that mark an operation as documented (directly, not via a factory). */
const COVERAGE_DECORATORS = new Set(['ApiOperation', 'ApiExcludeEndpoint'])

/** One discovered route, identified for readable failure output. */
type RouteEntry = {
  file: string
  method: string
  decoratorNames: string[]
}

/** Recursively lists every file under `dir` whose name matches `predicate`. */
function walk(dir: string, predicate: (name: string) => boolean, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full, predicate, out)
    } else if (predicate(entry.name)) {
      out.push(full)
    }
  }
  return out
}

/** Extracts the callee identifier name of a decorator expression, if it has one. */
function decoratorName(decorator: ts.Decorator): string | undefined {
  const expr = decorator.expression
  const callee = ts.isCallExpression(expr) ? expr.expression : expr
  if (ts.isIdentifier(callee)) return callee.text
  if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.name)) return callee.name.text
  return undefined
}

/** Parses a source file once, memoized by absolute path. */
const sourceFileCache = new Map<string, ts.SourceFile>()

function parse(filePath: string): ts.SourceFile {
  const cached = sourceFileCache.get(filePath)
  if (cached) return cached
  const text = readFileSync(filePath, 'utf8')
  const sourceFile = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true)
  sourceFileCache.set(filePath, sourceFile)
  return sourceFile
}

/** Finds every `*.controller.ts` file under the API's source tree. */
function findControllerFiles(): string[] {
  return walk(SRC_DIR, (name) => name.endsWith('.controller.ts') && !name.includes('.spec.'))
}

/** Extracts every route method (one with an HTTP-verb decorator) from a controller file. */
function findRoutes(filePath: string): RouteEntry[] {
  const sourceFile = parse(filePath)
  const routes: RouteEntry[] = []

  const visit = (node: ts.Node) => {
    if (ts.isMethodDeclaration(node)) {
      const decorators = ts.getDecorators(node) ?? []
      const names = decorators.map(decoratorName).filter((name): name is string => !!name)
      if (names.some((name) => HTTP_METHOD_DECORATORS.has(name))) {
        const methodName = ts.isIdentifier(node.name) ? node.name.text : '<computed>'
        routes.push({ file: filePath, method: methodName, decoratorNames: names })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)

  return routes
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

/** Checks whether an exported declaration named `name` in `dir` documents an ApiOperation. */
function resolvesToDocumentedFactory(dir: string, name: string): boolean {
  const files = walk(dir, (fileName) => fileName.endsWith('.ts') && !fileName.includes('.spec.'))

  for (const file of files) {
    const sourceFile = parse(file)
    let matchedText: string | undefined

    const visit = (node: ts.Node) => {
      if (matchedText) return
      if (
        ts.isFunctionDeclaration(node) &&
        node.name?.text === name &&
        node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
      ) {
        matchedText = node.getText(sourceFile)
      }
      if (ts.isVariableStatement(node)) {
        const isExported = node.modifiers?.some(
          (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
        )
        if (isExported) {
          for (const declaration of node.declarationList.declarations) {
            if (ts.isIdentifier(declaration.name) && declaration.name.text === name) {
              matchedText = node.getText(sourceFile)
            }
          }
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(sourceFile)

    if (matchedText) {
      return /\bApiOperation\s*\(|\bApiExcludeEndpoint\s*\(/.test(matchedText)
    }
  }

  return false
}

/** True when a route's decorators document it, directly or through a resolvable factory. */
function isDocumented(route: RouteEntry): boolean {
  if (route.decoratorNames.some((name) => COVERAGE_DECORATORS.has(name))) return true

  const sourceFile = parse(route.file)
  const fromDir = path.dirname(route.file)

  return route.decoratorNames.some((name) => {
    if (HTTP_METHOD_DECORATORS.has(name)) return false
    const specifier = findImportSpecifier(sourceFile, name)
    if (!specifier) return false
    const dir = resolveSpecifierDir(fromDir, specifier)
    if (!dir) return false
    return resolvesToDocumentedFactory(dir, name)
  })
}

describe('Swagger operation coverage', () => {
  const controllerFiles = findControllerFiles()
  const routes = controllerFiles.flatMap(findRoutes)

  it('discovers at least one controller and one route', () => {
    expect(controllerFiles.length).toBeGreaterThan(0)
    expect(routes.length).toBeGreaterThan(0)
  })

  it('documents every route with @ApiOperation or @ApiExcludeEndpoint', () => {
    const undocumented = routes
      .filter((route) => !isDocumented(route))
      .map((route) => `${path.relative(SRC_DIR, route.file)}::${route.method}`)

    expect(undocumented).toEqual([])
  })
})
