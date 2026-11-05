import { readdirSync } from 'node:fs'
import path from 'node:path'
import { parseFileByPath } from '@common/utils/parseFile'
import * as ts from 'typescript'

/*
 * Static (AST-based) controller route discovery for test code only.
 * Depends on the `typescript` devDependency, so it must stay out of the `@common/swagger` barrel.
 */

/** API source root, used to resolve path aliases and find controllers. */
export const SRC_DIR = path.resolve(__dirname, '../..')

/** A decorator factory referenced by value. */
type DecoratorFactory = (...args: never[]) => MethodDecorator

/** Decorators keyed by their source identifier, e.g. `{ Get, Post }`; keys are matched because `Get.name` is `''` at runtime. */
export type DecoratorMap = Record<string, DecoratorFactory>

/** One discovered route, identified for readable failure output. */
export type RouteEntry = {
  file: string
  method: string
  decoratorNames: string[]
}

/** Recursively lists every file under `dir` whose name matches `predicate`. */
export function walk(
  dir: string,
  predicate: (name: string) => boolean,
  out: string[] = [],
): string[] {
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

/** Finds every `*.controller.ts` file under the API's source tree. */
export function findControllerFiles(): string[] {
  return walk(SRC_DIR, (name) => name.endsWith('.controller.ts') && !name.includes('.spec.'))
}

/** Extracts every method carrying one of `routeDecorators` (e.g. `{ Get, Post }`) from a file. */
export function findRoutes(filePath: string, routeDecorators: DecoratorMap): RouteEntry[] {
  const routes: RouteEntry[] = []

  const visit = (node: ts.Node) => {
    if (ts.isMethodDeclaration(node)) {
      const decorators = ts.getDecorators(node) ?? []
      const names = decorators.map(decoratorName).filter((name): name is string => !!name)
      if (names.some((name) => Object.hasOwn(routeDecorators, name))) {
        const methodName = ts.isIdentifier(node.name) ? node.name.text : '<computed>'
        routes.push({ file: filePath, method: methodName, decoratorNames: names })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(parseFileByPath(filePath))

  return routes
}
