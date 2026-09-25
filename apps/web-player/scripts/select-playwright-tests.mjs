#!/usr/bin/env node
/**
 * Picks the Playwright specs a pull request's diff can actually affect, using
 * sniffler (https://github.com/callstackincubator/sniffler) for the import-graph
 * walk, and hands the result to the two `playwright test` invocations in
 * `.github/workflows/web_player_reusable.yml`.
 *
 * The one property this file exists to guarantee: **it fails open.** Every path
 * that is not "sniffler answered, and every input it was given is something the
 * import graph can actually model" ends in `runFull()`, which tells the workflow
 * to run the complete E2E and screenshot suites. A selector that quietly runs
 * zero tests is worse than no selector at all, so there is no code path here
 * that reports "nothing to run" on a failure — only on a successful analysis of
 * an entirely analysable diff.
 *
 * Usage (from anywhere; paths are derived from this file's location):
 *
 *   SNIFFLER_BASE_REF=<sha> node apps/web-player/scripts/select-playwright-tests.mjs
 *
 * Environment:
 *   SNIFFLER_BASE_REF  base commit of the diff. Empty/unset => full run.
 *   SNIFFLER_HEAD_REF  head commit of the diff. Defaults to HEAD.
 *   SNIFFLER_CLI       override the sniffler CLI entry (used by local runs that
 *                      have no installed node_modules).
 *   GITHUB_OUTPUT      when set, outputs are appended there as well as printed.
 *
 * Outputs (GitHub step outputs):
 *   mode              full | selected
 *   any               true | false   — anything at all to run
 *   e2e               true | false
 *   e2e-args          Playwright positional filters, space separated, '' when mode=full
 *   screenshot        true | false
 *   screenshot-args   as above
 */

import { execFileSync } from 'node:child_process'
import {
  appendFileSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, posix, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Directory of `apps/web-player`, derived from this file rather than from cwd. */
const APP_DIR = resolve(fileURLToPath(new URL('../', import.meta.url)))

/** Where this app sits inside the repository, as git reports changed paths. */
const APP_PREFIX = 'apps/web-player/'

const SNIFFLER_DIR = join(APP_DIR, '.sniffler')
const TEST_MAP_PATH = join(SNIFFLER_DIR, 'test-map.json')
const GENERATED_TSCONFIG_PATH = join(SNIFFLER_DIR, 'tsconfig.generated.json')
const SOURCE_TSCONFIG_PATH = join(APP_DIR, 'tsconfig.json')

/**
 * Changed files the import graph genuinely models. Anything else in the diff —
 * a lockfile, a CSS file, a Dockerfile, another workspace — forces a full run,
 * because sniffler reasons about TypeScript imports and nothing else.
 */
const ANALYSABLE_PREFIXES = [`${APP_PREFIX}src/`, `${APP_PREFIX}tests/`]
const ANALYSABLE_SUFFIXES = ['.ts', '.tsx']

/**
 * Changed files that cannot affect the rendered application under any
 * circumstances, so their presence in the diff neither selects a test nor
 * forces a full run.
 */
const IGNORABLE_PREFIXES = ['.claude/', '.changeset/', 'apps/docs/']
const IGNORABLE_SUFFIXES = ['.md']

/** A diff wider than this is not worth analysing, and risks ARG_MAX. */
const MAX_ANALYSABLE_CHANGED_FILES = 400

/** Playwright filters are interpolated into a shell word list; keep them boring. */
const SAFE_TEST_PATH = /^[A-Za-z0-9._/-]+$/

const log = (message) => {
  process.stdout.write(`${message}\n`)
}

const warn = (message) => {
  process.stdout.write(
    `::warning title=Playwright test selection::${message}\n`,
  )
}

const notice = (message) => {
  process.stdout.write(`::notice title=Playwright test selection::${message}\n`)
}

const emit = (outputs) => {
  for (const [key, value] of Object.entries(outputs)) {
    log(`${key}=${value}`)
  }

  const outputFile = process.env.GITHUB_OUTPUT

  if (!outputFile) {
    return
  }

  const lines = Object.entries(outputs)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  appendFileSync(outputFile, `${lines}\n`)
}

/** Runs the whole suite. Every failure and every doubt lands here. */
const runFull = (reason) => {
  warn(`running the full Playwright suite — ${reason}`)
  emit({
    mode: 'full',
    any: 'true',
    e2e: 'true',
    'e2e-args': '',
    screenshot: 'true',
    'screenshot-args': '',
  })
  process.exit(0)
}

const git = (args) =>
  execFileSync('git', args, {
    cwd: APP_DIR,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

/** `true` when the ref names a commit object this clone actually has. */
const hasCommit = (ref) => {
  try {
    git(['cat-file', '-e', `${ref}^{commit}`])
    return true
  } catch {
    return false
  }
}

/**
 * Strips `//` and block comments from JSONC. String-aware, so a `//` inside a
 * path or a URL survives.
 */
const stripJsonComments = (raw) => {
  let out = ''
  let index = 0
  let inString = false
  let escaped = false

  while (index < raw.length) {
    const char = raw[index]

    if (inString) {
      out += char
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === '"') {
        inString = false
      }
      index += 1
      continue
    }

    if (char === '"') {
      inString = true
      out += char
      index += 1
      continue
    }

    if (char === '/' && raw[index + 1] === '/') {
      while (index < raw.length && raw[index] !== '\n') {
        index += 1
      }
      continue
    }

    if (char === '/' && raw[index + 1] === '*') {
      index += 2
      while (
        index < raw.length &&
        !(raw[index] === '*' && raw[index + 1] === '/')
      ) {
        index += 1
      }
      index += 2
      continue
    }

    out += char
    index += 1
  }

  return out
}

/**
 * sniffler reads a tsconfig with `JSON.parse`, and this app's `tsconfig.json`
 * carries a block comment explaining its per-layer path aliases. A JSONC
 * tsconfig therefore parses as *no* aliases at all — which does not error, it
 * silently produces an import graph with no `@/…` edges and an empty selection.
 * Generating a comment-free copy from the real file on every run is what keeps
 * the alias table single-sourced.
 */
const generateSnifflerTsconfig = () => {
  const parsed = JSON.parse(
    stripJsonComments(readFileSync(SOURCE_TSCONFIG_PATH, 'utf8')),
  )
  const compilerOptions = parsed?.compilerOptions

  if (!compilerOptions || typeof compilerOptions !== 'object') {
    throw new Error(`${SOURCE_TSCONFIG_PATH} declares no compilerOptions`)
  }

  const paths = compilerOptions.paths

  if (!paths || typeof paths !== 'object' || Object.keys(paths).length === 0) {
    throw new Error(`${SOURCE_TSCONFIG_PATH} declares no compilerOptions.paths`)
  }

  /** sniffler resolves baseUrl against the tsconfig's own directory. */
  const sourceBaseUrl = resolve(
    dirname(SOURCE_TSCONFIG_PATH),
    typeof compilerOptions.baseUrl === 'string' ? compilerOptions.baseUrl : '.',
  )
  const baseUrl =
    relative(dirname(GENERATED_TSCONFIG_PATH), sourceBaseUrl) || '.'

  mkdirSync(SNIFFLER_DIR, { recursive: true })
  writeFileSync(
    GENERATED_TSCONFIG_PATH,
    `${JSON.stringify({ compilerOptions: { baseUrl, paths } }, null, 2)}\n`,
  )

  return Object.keys(paths).length
}

/** Every Playwright spec that exists on disk, as app-relative posix paths. */
const discoverSpecsOnDisk = () => {
  const found = []

  const walk = (absoluteDir) => {
    for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
      const absolute = join(absoluteDir, entry.name)

      if (entry.isDirectory()) {
        if (
          entry.name === 'node_modules' ||
          entry.name.endsWith('-snapshots')
        ) {
          continue
        }
        walk(absolute)
        continue
      }

      const appRelative = relative(APP_DIR, absolute)
        .split(/[\\/]/)
        .join(posix.sep)

      if (
        /\.e2e-spec\.tsx?$/.test(appRelative) &&
        appRelative.startsWith('tests/e2e/')
      ) {
        found.push(appRelative)
        continue
      }

      if (
        /\.screenshot-spec\.tsx?$/.test(appRelative) &&
        appRelative.startsWith('src/')
      ) {
        found.push(appRelative)
      }
    }
  }

  walk(join(APP_DIR, 'src'))
  walk(join(APP_DIR, 'tests'))

  return found.sort()
}

/**
 * A spec that exists but is absent from the test map would never be selected —
 * a silent loss of coverage that no gate would report. So the map and the disk
 * must agree exactly, and any disagreement runs everything.
 */
const assertTestMapMatchesDisk = () => {
  const map = JSON.parse(readFileSync(TEST_MAP_PATH, 'utf8'))

  if (!Array.isArray(map)) {
    throw new Error(`${TEST_MAP_PATH} is not a JSON array`)
  }

  const mapped = map.map((entry) => entry?.test)

  if (mapped.some((test) => typeof test !== 'string' || test.length === 0)) {
    throw new Error(`${TEST_MAP_PATH} has an entry with no "test" path`)
  }

  const onDisk = discoverSpecsOnDisk()
  const missingFromMap = onDisk.filter((spec) => !mapped.includes(spec))
  const missingFromDisk = mapped.filter((spec) => !onDisk.includes(spec))

  return { missingFromMap, missingFromDisk, total: onDisk.length }
}

const resolveSnifflerCli = () => {
  const override = process.env.SNIFFLER_CLI?.trim()

  if (override) {
    return override
  }

  return createRequire(join(APP_DIR, 'package.json')).resolve(
    'sniffler/dist/cli.js',
  )
}

const classifyChangedFile = (file) => {
  if (
    IGNORABLE_PREFIXES.some((prefix) => file.startsWith(prefix)) ||
    IGNORABLE_SUFFIXES.some((suffix) => file.endsWith(suffix))
  ) {
    return 'ignorable'
  }

  if (
    ANALYSABLE_PREFIXES.some((prefix) => file.startsWith(prefix)) &&
    ANALYSABLE_SUFFIXES.some((suffix) => file.endsWith(suffix))
  ) {
    return 'analysable'
  }

  return 'opaque'
}

const main = () => {
  const base = process.env.SNIFFLER_BASE_REF?.trim()
  const head = process.env.SNIFFLER_HEAD_REF?.trim() || 'HEAD'

  if (!base) {
    runFull('no base ref was supplied, so there is no diff to analyse')
  }

  if (!hasCommit(base)) {
    log(`base commit ${base} is not in this clone; fetching it`)
    try {
      git(['fetch', '--no-tags', '--depth=1', 'origin', base])
    } catch (error) {
      log(String(error?.message ?? error))
    }
  }

  if (!hasCommit(base)) {
    runFull(`base commit ${base} could not be resolved in this checkout`)
  }

  if (!hasCommit(head)) {
    runFull(`head commit ${head} could not be resolved in this checkout`)
  }

  let changed = []

  try {
    changed = git(['diff', '--name-only', base, head])
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
  } catch (error) {
    runFull(
      `git diff ${base}..${head} failed: ${String(error?.message ?? error)}`,
    )
  }

  if (changed.length === 0) {
    runFull(`git diff ${base}..${head} reported no changed files`)
  }

  const opaque = changed.filter(
    (file) => classifyChangedFile(file) === 'opaque',
  )

  if (opaque.length > 0) {
    runFull(
      `${opaque.length} changed file(s) are outside the analysable set, first: ${opaque[0]}`,
    )
  }

  const analysable = changed.filter(
    (file) => classifyChangedFile(file) === 'analysable',
  )

  if (analysable.length === 0) {
    runFull('the diff contains no analysable web-player source file')
  }

  if (analysable.length > MAX_ANALYSABLE_CHANGED_FILES) {
    runFull(`${analysable.length} changed source files is too many to analyse`)
  }

  let mapCheck

  try {
    mapCheck = assertTestMapMatchesDisk()
  } catch (error) {
    runFull(
      `the sniffler test map could not be read: ${String(error?.message ?? error)}`,
    )
  }

  if (mapCheck.missingFromMap.length > 0) {
    runFull(
      `spec(s) absent from .sniffler/test-map.json: ${mapCheck.missingFromMap.join(', ')} — add them to the map`,
    )
  }

  if (mapCheck.missingFromDisk.length > 0) {
    runFull(
      `.sniffler/test-map.json names spec(s) that no longer exist: ${mapCheck.missingFromDisk.join(', ')}`,
    )
  }

  try {
    const aliasCount = generateSnifflerTsconfig()
    log(
      `generated .sniffler/tsconfig.generated.json with ${aliasCount} path alias(es)`,
    )
  } catch (error) {
    runFull(
      `the tsconfig path aliases could not be read: ${String(error?.message ?? error)}`,
    )
  }

  let cli

  try {
    cli = resolveSnifflerCli()
  } catch (error) {
    runFull(
      `the sniffler CLI could not be resolved: ${String(error?.message ?? error)}`,
    )
  }

  const appRelativeChanged = analysable.map((file) =>
    file.slice(APP_PREFIX.length),
  )
  let raw = ''

  try {
    raw = execFileSync(
      process.execPath,
      [cli, 'impact', ...appRelativeChanged, '--format', 'json'],
      { cwd: APP_DIR, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    )
  } catch (error) {
    runFull(`sniffler impact failed: ${String(error?.message ?? error)}`)
  }

  let impact

  try {
    impact = JSON.parse(raw)
  } catch {
    runFull('sniffler impact did not produce parseable JSON')
  }

  if (!Array.isArray(impact?.recommendedTests)) {
    runFull('sniffler impact produced no recommendedTests array')
  }

  for (const message of Array.isArray(impact.warnings) ? impact.warnings : []) {
    notice(`sniffler: ${message}`)
  }

  const selected = [
    ...new Set(impact.recommendedTests.map((entry) => entry?.test)),
  ]

  if (
    selected.some(
      (test) => typeof test !== 'string' || !SAFE_TEST_PATH.test(test),
    )
  ) {
    runFull(
      'sniffler recommended a test path this script will not pass to a shell',
    )
  }

  const known = JSON.parse(readFileSync(TEST_MAP_PATH, 'utf8')).map(
    (entry) => entry.test,
  )
  const unknown = selected.filter((test) => !known.includes(test))

  if (unknown.length > 0) {
    runFull(`sniffler recommended unrecognised spec(s): ${unknown.join(', ')}`)
  }

  const e2e = selected.filter((test) => test.startsWith('tests/e2e/')).sort()
  const screenshot = selected
    .filter((test) => /\.screenshot-spec\.tsx?$/.test(test))
    .sort()

  if (e2e.length + screenshot.length !== selected.length) {
    runFull(
      'a recommended spec belongs to neither the E2E nor the screenshot suite',
    )
  }

  log(
    `analysed ${analysable.length} changed source file(s) against ${mapCheck.total} spec(s)`,
  )
  notice(
    `selected ${e2e.length} E2E and ${screenshot.length} screenshot spec(s) out of ${mapCheck.total}`,
  )

  emit({
    mode: 'selected',
    any: String(e2e.length + screenshot.length > 0),
    e2e: String(e2e.length > 0),
    'e2e-args': e2e.join(' '),
    screenshot: String(screenshot.length > 0),
    'screenshot-args': screenshot.join(' '),
  })
}

try {
  main()
} catch (error) {
  runFull(`the selector itself threw: ${String(error?.stack ?? error)}`)
}
