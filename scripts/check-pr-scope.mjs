#!/usr/bin/env node
/**
 * Pull request scope gate: one PR changes at most one workspace, 200 files and 3000 lines.
 *
 * - A workspace is a directory directly under apps/ or packages/. Everything else (root
 *   config, .github, .claude, infra, scripts, pencil) is shared and never counts as a second
 *   one, so a CI or tooling change can ride along with the app it serves. apps/docs is shared
 *   too: the PR checklist asks for its pages to change with the behaviour they describe.
 * - Lines are additions plus deletions from `git diff --numstat`, renames detected, so a pure
 *   move costs a file and no lines. Binary files cost a file and no lines.
 * - Generated or release-managed output counts toward nothing: lockfiles, the OpenAPI
 *   contract, *.gen.ts, test snapshots, changesets and CHANGELOGs, Pencil design sources.
 *
 * Usage: node scripts/check-pr-scope.mjs [base-ref] [head-ref]   (origin/develop, HEAD)
 * The diff is base...head, the same range GitHub shows on the pull request.
 *
 * Exempt in CI, never here: release, back-merge, changeset-release and Dependabot branches, and
 * a PR carrying the `pr-scope/exempt` label — see .github/workflows/pr_scope_reusable.yml.
 */
import { execFileSync } from 'node:child_process'

const MAX_WORKSPACES = 1
const MAX_FILES = 200
const MAX_LINES = 3000

const IGNORED = [
  /(^|\/)pnpm-lock\.yaml$/,
  /(^|\/)Cargo\.lock$/,
  /^packages\/contracts\/src\/api\/v\d+\.ts$/,
  /\.gen\.ts$/,
  /(^|\/)__snapshots__\//,
  /\.snap$/,
  /-snapshots\//,
  /^\.changeset\/.+\.md$/,
  /(^|\/)CHANGELOG\.md$/,
  /^pencil\//,
]

const SHARED_WORKSPACES = new Set(['apps/docs'])

const workspaceOf = (path) => {
  const workspace = /^((?:apps|packages)\/[^/]+)\//.exec(path)?.[1]
  return SHARED_WORKSPACES.has(workspace) ? undefined : workspace
}

/** Parses `git diff --numstat -z`: `add\tdel\tpath\0`, or `add\tdel\t\0from\0to\0` for a rename. */
const parseNumstat = (raw) => {
  const fields = raw.split('\0')
  const entries = []
  for (let i = 0; i < fields.length; i++) {
    if (!fields[i]) continue
    const [added, deleted, path] = fields[i].split('\t')
    const binary = added === '-'
    const entry = { added: binary ? 0 : Number(added), deleted: binary ? 0 : Number(deleted) }
    if (path) {
      entries.push({ ...entry, paths: [path] })
    } else {
      entries.push({ ...entry, paths: [fields[i + 1], fields[i + 2]] })
      i += 2
    }
  }
  return entries
}

const [base = 'origin/develop', head = 'HEAD'] = process.argv.slice(2)
let raw
try {
  raw = execFileSync('git', ['diff', '--numstat', '-z', '-M', `${base}...${head}`], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'inherit'],
  })
} catch {
  console.error(`Cannot diff ${base}...${head}; fetch both refs first.`)
  process.exit(2)
}

const workspaces = new Map()
let files = 0
let lines = 0
let ignored = 0

for (const { added, deleted, paths } of parseNumstat(raw)) {
  if (paths.every((path) => IGNORED.some((pattern) => pattern.test(path)))) {
    ignored++
    continue
  }
  files++
  lines += added + deleted
  for (const workspace of new Set(paths.map(workspaceOf).filter(Boolean))) {
    workspaces.set(workspace, (workspaces.get(workspace) ?? 0) + 1)
  }
}

const failures = []
if (workspaces.size > MAX_WORKSPACES) {
  failures.push(`${workspaces.size} workspaces changed, the limit is ${MAX_WORKSPACES}`)
}
if (files > MAX_FILES) failures.push(`${files} files changed, the limit is ${MAX_FILES}`)
if (lines > MAX_LINES) failures.push(`${lines} lines changed, the limit is ${MAX_LINES}`)

console.log(`PR scope of ${base}...${head}:`)
console.log(`  workspaces  ${workspaces.size}/${MAX_WORKSPACES}`)
for (const [workspace, count] of workspaces) console.log(`    ${workspace} (${count} files)`)
console.log(`  files       ${files}/${MAX_FILES}`)
console.log(`  lines       ${lines}/${MAX_LINES} (additions + deletions)`)
console.log(`  ignored     ${ignored} generated or release-managed files`)

if (failures.length > 0) {
  console.error(`\nPR scope exceeded:\n${failures.map((failure) => `  - ${failure}`).join('\n')}`)
  console.error(
    '\nSplit the branch into pull requests that each stand alone (see "Commit and' +
      ' pull-request size" in .claude/rules/commit-style.md).',
  )
  process.exitCode = 1
}
