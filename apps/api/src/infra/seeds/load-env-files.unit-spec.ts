import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { loadEnvFiles } from './load-env-files'

describe('loadEnvFiles', () => {
  let root: string

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'bitrate-load-env-files-'))
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it('loads a variable from the only file present', () => {
    writeFileSync(join(root, '.env'), 'DATABASE_URL=postgres://from-env\n')
    const target: NodeJS.ProcessEnv = {}

    const loaded = loadEnvFiles({ root, files: ['.env.local', '.env'], target })

    expect(target.DATABASE_URL).toBe('postgres://from-env')
    expect(loaded).toEqual(['.env'])
  })

  it('lets the first listed file win when both define the same variable', () => {
    writeFileSync(join(root, '.env.local'), 'DATABASE_URL=postgres://from-local\n')
    writeFileSync(join(root, '.env'), 'DATABASE_URL=postgres://from-env\n')
    const target: NodeJS.ProcessEnv = {}

    loadEnvFiles({ root, files: ['.env.local', '.env'], target })

    expect(target.DATABASE_URL).toBe('postgres://from-local')
  })

  it('merges variables unique to each file, in checked order', () => {
    writeFileSync(join(root, '.env.local'), 'FOO=local\n')
    writeFileSync(join(root, '.env'), 'BAR=env\n')
    const target: NodeJS.ProcessEnv = {}

    const loaded = loadEnvFiles({ root, files: ['.env.local', '.env'], target })

    expect(target).toMatchObject({ FOO: 'local', BAR: 'env' })
    expect(loaded).toEqual(['.env.local', '.env'])
  })

  it('never overwrites a variable already set — a real shell variable beats every file', () => {
    writeFileSync(join(root, '.env.local'), 'DATABASE_URL=postgres://from-local\n')
    const target: NodeJS.ProcessEnv = { DATABASE_URL: 'postgres://from-shell' }

    loadEnvFiles({ root, files: ['.env.local'], target })

    expect(target.DATABASE_URL).toBe('postgres://from-shell')
  })

  it('skips a missing file silently instead of throwing', () => {
    writeFileSync(join(root, '.env'), 'FOO=bar\n')
    const target: NodeJS.ProcessEnv = {}

    const loaded = loadEnvFiles({ root, files: ['.env.local', '.env'], target })

    expect(target.FOO).toBe('bar')
    expect(loaded).toEqual(['.env'])
  })

  it('returns an empty list and leaves target untouched when no file exists', () => {
    const target: NodeJS.ProcessEnv = {}

    const loaded = loadEnvFiles({ root, files: ['.env.local', '.env'], target })

    expect(loaded).toEqual([])
    expect(target).toEqual({})
  })
})
