/**
 * Checks for `bitrate-api/prisma-write-ownership`: the ownership map covers the real schema, and
 * the rule behaves as documented when oxlint itself runs it over `fixtures/`.
 *
 * Run with `pnpm --filter @bitrate/api lint:data-ownership` (it puts `oxlint` on PATH).
 */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { DATA_OWNERS } from './data-ownership.mjs'
import { API_SCHEMA_PATH, readSchemaModels, scopeOf } from './prisma-write-ownership.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const srcRoot = join(here, '..', 'src')
const baseline = JSON.parse(readFileSync(join(here, 'data-ownership-baseline.json'), 'utf8'))

/** The folder a scope name stands for. */
const scopeFolder = (scope) =>
  scope.startsWith('infra/') ? join(srcRoot, scope) : join(srcRoot, 'modules', scope)

describe('data ownership map', () => {
  const models = readSchemaModels(API_SCHEMA_PATH)

  it('names an owner for every schema model', () => {
    const unowned = [...models].filter((model) => DATA_OWNERS[model] === undefined)
    assert.deepEqual(unowned, [])
  })

  it('lists only models that exist in the schema', () => {
    const unknown = Object.keys(DATA_OWNERS).filter((model) => !models.has(model))
    assert.deepEqual(unknown, [])
  })

  it('points every owner at an existing folder', () => {
    const missing = [...new Set(Object.values(DATA_OWNERS).flat())].filter(
      (scope) => !(existsSync(scopeFolder(scope)) && statSync(scopeFolder(scope)).isDirectory()),
    )
    assert.deepEqual(missing, [])
  })

  it('keeps baseline entries for existing files and foreign models only', () => {
    for (const [file, allowance] of Object.entries(baseline)) {
      assert.ok(existsSync(join(srcRoot, file)), `${file} no longer exists`)
      const scope = scopeOf(srcRoot, join(srcRoot, file))
      for (const [model, count] of Object.entries(allowance)) {
        assert.ok(count > 0, `${file}: ${model} allowance must be positive`)
        assert.ok(!DATA_OWNERS[model]?.includes(scope), `${file}: ${scope} owns ${model}`)
      }
    }
  })
})

describe('scopeOf', () => {
  for (const [path, scope] of [
    ['modules/tracks/tracks.service.ts', 'tracks'],
    ['modules/tracks/processing-log/recorder.ts', 'tracks'],
    ['modules/admin/genres/admin-genres.service.ts', 'admin/genres'],
    ['modules/admin/admin-batch.controller.ts', 'admin'],
    ['infra/observability/audit.interceptor.ts', 'infra/observability'],
    ['common/utils/prisma.ts', 'common'],
  ]) {
    it(`maps ${path} to ${scope}`, () => {
      assert.equal(scopeOf(srcRoot, join(srcRoot, path)), scope)
    })
  }

  it('ignores files outside src', () => {
    assert.equal(scopeOf(srcRoot, join(here, 'data-ownership.mjs')), undefined)
  })
})

describe('prisma-write-ownership under oxlint', () => {
  const fixtures = join(here, 'fixtures')
  const run = spawnSync('oxlint', ['-c', '.oxlintrc.json', '--format', 'unix', 'src'], {
    cwd: fixtures,
    encoding: 'utf8',
  })
  const diagnostics = run.stdout
    .split('\n')
    .filter((line) => line.includes('prisma-write-ownership'))
    .map((line) => line.replace(/^src\//, ''))

  const reported = (file, text) =>
    diagnostics.filter((line) => line.startsWith(file) && line.includes(text)).length

  it('fails the run', () => {
    assert.equal(run.error, undefined, String(run.error))
    assert.equal(run.status, 1, run.stdout + run.stderr)
  })

  it('reports foreign writes, through any client alias', () => {
    assert.equal(reported('modules/albums/foreign.ts', '`track` is owned by `tracks`'), 2)
  })

  it('reports a write to a model with no owner', () => {
    assert.equal(reported('modules/albums/foreign.ts', '`orphan` has no owner'), 1)
  })

  it('accepts the owner’s writes and everyone’s reads', () => {
    assert.equal(reported('modules/tracks/owner.ts', ''), 0)
  })

  it('accepts foreign writes the baseline still allows', () => {
    assert.equal(reported('modules/admin/tracks/baselined.ts', ''), 0)
  })

  it('asks to lower a baseline entry once writes are removed', () => {
    assert.equal(reported('modules/history/stale.ts', 'Lower the entry to 1'), 1)
  })

  it('reports nothing else', () => {
    assert.equal(diagnostics.length, 4, diagnostics.join('\n'))
  })
})
