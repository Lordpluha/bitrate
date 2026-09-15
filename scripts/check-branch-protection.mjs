#!/usr/bin/env node
/**
 * Reports — and, with `--apply`, sets — the required status checks on the release target branch.
 *
 *   pnpm check:branch-protection            # report only, changes nothing
 *   pnpm check:branch-protection --apply    # register the missing contexts
 *   pnpm check:branch-protection --branch develop --apply
 *   pnpm check:branch-protection --repo Someone/fork --apply
 *
 * The release chain (ADR-0029) reports its layer-1 gates as commit statuses on the release
 * branch head. Branch protection matches required checks by context *name*, and a status can be
 * posted on a commit whether or not any `pull_request` run ever existed — which is what makes
 * those two contexts a usable gate on a pull request the workflow opened itself.
 *
 * This is not something CI can do. A workflow's `permissions:` block has no `administration`
 * scope, so `GITHUB_TOKEN` genuinely cannot edit branch protection. A repository admin can, from
 * their own machine, which is what this script is for. The GitHub UI cannot: its picker only
 * offers checks it has seen in the last seven days, and these have never run.
 *
 * Two safety properties, both deliberate:
 *
 *   - It uses the narrow `PATCH .../protection/required_status_checks` endpoint and sends only
 *     `checks`. A full `PUT .../protection` would silently reset every rule it did not mention —
 *     required reviews, signatures, force-push and deletion settings included.
 *   - It only ever adds. An existing required context it does not know about is preserved.
 */

import { execFileSync } from 'node:child_process'

/**
 * Contexts the release chain posts. These strings are the contract between
 * `.github/workflows/release_reusable.yml` and branch protection: renaming one there without
 * renaming it here silently turns the gate off.
 */
const RELEASE_CONTEXTS = ['bitrate/release-gates', 'bitrate/release-version']

const DEFAULT_REPO = 'Lordpluha/bitrate'
const DEFAULT_BRANCH = 'master'

const args = process.argv.slice(2)
const apply = args.includes('--apply')

/** @param {string} flag @param {string} fallback @returns {string} */
function flagValue(flag, fallback) {
  const index = args.indexOf(flag)
  if (index === -1) return fallback
  const value = args[index + 1]
  if (!value || value.startsWith('--')) {
    console.error(`\n  ${flag} was given without a value.\n`)
    process.exit(1)
  }
  return value
}

const REPO = flagValue('--repo', DEFAULT_REPO)
const branch = flagValue('--branch', DEFAULT_BRANCH)

/**
 * `gh` is installed on the host but not inside the VS Code Flatpak sandbox, where this repository
 * is often opened. Probe both rather than telling a developer with a working `gh` that they do
 * not have one.
 */
function resolveGh() {
  for (const candidate of [
    { command: 'gh', prefix: [] },
    { command: 'flatpak-spawn', prefix: ['--host', 'gh'] },
  ]) {
    try {
      execFileSync(candidate.command, [...candidate.prefix, '--version'], { stdio: 'ignore' })
      return candidate
    } catch {
      /* try the next transport */
    }
  }
  return null
}

const gh = resolveGh()

if (!gh) {
  fail(
    'The GitHub CLI is not reachable, directly or through flatpak-spawn.\n' +
      'Install it from https://cli.github.com/ and run `gh auth login`.',
  )
}

/** @param {string[]} argv @returns {string} */
function ghApi(argv) {
  return execFileSync(gh.command, [...gh.prefix, 'api', ...argv], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

/** @param {string} message */
function fail(message) {
  console.error(`\n  ${message}\n`)
  process.exit(1)
}

/* ------------------------------------------------------------------ */

console.log(`\n  Repository:  ${REPO}`)
console.log(`  Branch:      ${branch}`)
console.log(`  Mode:        ${apply ? 'apply' : 'report only (pass --apply to change anything)'}\n`)

let permissions
try {
  permissions = JSON.parse(ghApi([`repos/${REPO}`, '--jq', '.permissions']))
} catch (error) {
  fail(
    `Could not read ${REPO}. Is \`gh\` authenticated?\n` +
      `  Run \`gh auth status\`, then \`gh auth login\` if it is not.\n\n${String(error.stderr ?? error.message).trim()}`,
  )
}

if (!permissions?.admin) {
  fail(
    `You do not have admin rights on ${REPO}, so branch protection cannot be read or written.\n` +
      '  Ask a repository owner to run this, or to add the contexts by hand under\n' +
      `  Settings -> Branches -> ${branch} -> Require status checks to pass.`,
  )
}

let current
try {
  current = JSON.parse(
    ghApi([`repos/${REPO}/branches/${branch}/protection/required_status_checks`]),
  )
} catch (error) {
  fail(
    `Could not read required status checks for \`${branch}\`.\n` +
      `  Either \`${branch}\` is not a branch of ${REPO}, or it has no protection rule with\n` +
      '  "Require status checks to pass before merging" enabled. Enable it once in the UI\n' +
      '  (Settings -> Branches), then re-run.\n\n' +
      String(error.stderr ?? error.message).trim(),
  )
}

/** Existing entries, in the `checks` shape the API now returns. */
const existing = Array.isArray(current.checks) ? current.checks : []
const existingContexts = new Set(existing.map((check) => check.context))
const missing = RELEASE_CONTEXTS.filter((context) => !existingContexts.has(context))

console.log(`  strict (branch must be up to date): ${current.strict}`)
console.log('  currently required:')
if (existing.length === 0) {
  console.log('    (none)')
} else {
  for (const check of existing) {
    console.log(`    ${check.context}`)
  }
}

if (missing.length === 0) {
  console.log('\n  Every release context is already required. Nothing to do.\n')
  process.exit(0)
}

console.log('\n  missing, and would be added:')
for (const context of missing) {
  console.log(`    ${context}`)
}

if (!apply) {
  console.log('\n  Report only. Re-run with --apply to register them.\n')
  process.exit(0)
}

/**
 * Only `checks` is sent. `strict` is deliberately omitted so this cannot flip it, and the
 * endpoint leaves an omitted field alone. Existing entries are carried through, so a context
 * this script does not know about is never dropped.
 */
const payload = JSON.stringify({
  checks: [
    ...existing.map(({ context, app_id }) => (app_id ? { context, app_id } : { context })),
    ...missing.map((context) => ({ context })),
  ],
})

try {
  const updated = JSON.parse(
    execFileSync(
      gh.command,
      [
        ...gh.prefix,
        'api',
        '--method',
        'PATCH',
        `repos/${REPO}/branches/${branch}/protection/required_status_checks`,
        '--input',
        '-',
      ],
      { input: payload, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
    ),
  )

  console.log('\n  Now required:')
  for (const check of updated.checks ?? []) {
    console.log(`    ${check.context}`)
  }
  console.log('')
} catch (error) {
  fail(
    `Could not update required status checks.\n\n${String(error.stderr ?? error.message).trim()}`,
  )
}
