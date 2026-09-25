import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { forbiddenRuntimeImports } from './runtime-import-scanner'

/**
 * `src/contract/**` must stay importable from a server bundle with no DOM and no
 * custom-element registry — see `.claude/rules/player-rules.md`. This walks the directory
 * itself and parses every file with the real TypeScript compiler AST (`runtime-import-
 * scanner.ts`), rather than trusting the ESLint `no-restricted-imports`/`no-restricted-syntax`
 * override alone, so a lint config regression still fails the build. `import type` /
 * `export type` are allowed: they erase at compile time and carry no runtime dependency.
 */

const CONTRACT_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      yield* walk(path)
    } else if (/\.tsx?$/.test(path)) {
      yield path
    }
  }
}

describe('contract boundary', () => {
  it('has no runtime import of svelte, .svelte files, element/, embed/, or the package default/element/engine entries', () => {
    const offenders: Array<{ file: string; specifier: string }> = []

    for (const file of walk(CONTRACT_ROOT)) {
      const source = readFileSync(file, 'utf8')
      for (const specifier of forbiddenRuntimeImports(source, file)) {
        offenders.push({ file, specifier })
      }
    }

    expect(offenders).toEqual([])
  })

  it('walked at least one real contract file, so the previous assertion is not vacuous', () => {
    const files = [...walk(CONTRACT_ROOT)]

    expect(files).toContain(join(CONTRACT_ROOT, 'index.ts'))
    expect(files.length).toBeGreaterThan(0)
  })
})
