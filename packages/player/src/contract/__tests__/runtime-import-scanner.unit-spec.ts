import { describe, expect, it } from 'vitest'
import {
  forbiddenRuntimeImports,
  isForbiddenSpecifier,
  runtimeImportSpecifiers,
} from './runtime-import-scanner'

/**
 * Unit-tests the parser the boundary spec depends on, directly on source strings — see
 * `contract-boundary.unit-spec.ts` for the directory-walking spec that uses it.
 */
describe('isForbiddenSpecifier', () => {
  it.each([
    'svelte',
    'svelte/internal/client',
    './Foo.svelte',
    '../embed/Foo.svelte',
    '../element',
    '../element/index',
    '../embed',
    '../embed/index',
    '@bitrate/player',
    '@bitrate/player/element',
    '@bitrate/player/engine',
  ])('flags %s as forbidden', (specifier) => {
    expect(isForbiddenSpecifier(specifier)).toBe(true)
  })

  it.each(['zod', 'vitest', '@bitrate/player/contract', '../lib/format', './types', 'node:fs'])(
    'allows %s',
    (specifier) => {
      expect(isForbiddenSpecifier(specifier)).toBe(false)
    },
  )
})

describe('runtimeImportSpecifiers', () => {
  it('collects a static named import', () => {
    expect(runtimeImportSpecifiers("import { a } from '../element'")).toEqual(['../element'])
  })

  it('collects a bare side-effect import', () => {
    expect(runtimeImportSpecifiers("import 'svelte'")).toEqual(['svelte'])
  })

  it('collects a re-export', () => {
    expect(runtimeImportSpecifiers("export { a } from '../element'")).toEqual(['../element'])
  })

  it('collects a dynamic import inside an async function', () => {
    expect(runtimeImportSpecifiers("export async function f() { await import('svelte') }")).toEqual(
      ['svelte'],
    )
  })

  it('collects a directory import with no trailing segment', () => {
    expect(runtimeImportSpecifiers("import { a } from '../element/index'")).toEqual([
      '../element/index',
    ])
  })

  it('collects a .svelte file import', () => {
    expect(runtimeImportSpecifiers("import Foo from './Foo.svelte'")).toEqual(['./Foo.svelte'])
  })

  it('collects a self-package import', () => {
    expect(runtimeImportSpecifiers("import x from '@bitrate/player'")).toEqual(['@bitrate/player'])
  })

  it('excludes a type-only named import', () => {
    expect(runtimeImportSpecifiers("import type { X } from 'svelte'")).toEqual([])
  })

  it('excludes a type-only re-export', () => {
    expect(runtimeImportSpecifiers("export type { X } from 'svelte'")).toEqual([])
  })

  it('does not flag an unrelated dynamic import', () => {
    expect(runtimeImportSpecifiers("await import('zod')")).toEqual(['zod'])
  })
})

describe('forbiddenRuntimeImports', () => {
  it('reports only the forbidden specifiers found', () => {
    const source = `
      import type { PlayerChrome } from 'svelte'
      import { z } from 'zod'
      import { registerFoo } from '../element'
    `

    expect(forbiddenRuntimeImports(source)).toEqual(['../element'])
  })

  it('reports nothing for a clean contract module', () => {
    const source = `
      import { z } from 'zod'
      export type PlayerChrome = 'bar' | 'mini' | 'none'
    `

    expect(forbiddenRuntimeImports(source)).toEqual([])
  })
})
