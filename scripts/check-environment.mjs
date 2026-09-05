#!/usr/bin/env node
/**
 * Verifies that this machine can build and run the repository: the external toolchain, the
 * installed dependencies of each workspace, and the extra native tooling a few workspaces need.
 *
 * Run it for everything, or for the subset you actually intend to work on:
 *
 *   pnpm check:env
 *   pnpm check:env api ui-react
 *
 * The tool minimums live here rather than in README.md so there is one place to change them.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const useColor = process.stdout.isTTY && !process.env.NO_COLOR

/**
 * External tools. `min` is the lowest version that is known to work; `exact` pins a version the
 * repository itself declares, so a mismatch is a real problem rather than a preference.
 */
const TOOLS = {
  node: {
    label: 'Node.js',
    args: ['--version'],
    min: readJson(join(ROOT, 'package.json')).engines?.node?.replace(/^\D+/, '') ?? '24',
    source: 'package.json » engines.node',
    install: 'https://nodejs.org/en/download',
  },
  pnpm: {
    label: 'pnpm',
    args: ['--version'],
    exact: readJson(join(ROOT, 'package.json')).packageManager?.split('@')[1],
    source: 'package.json » packageManager',
    install: 'https://pnpm.io/installation',
  },
  git: {
    label: 'Git',
    args: ['--version'],
    min: '2',
    install: 'https://git-scm.com/downloads',
  },
  docker: {
    label: 'Docker',
    args: ['--version'],
    min: '24',
    install: 'https://docs.docker.com/engine/install/',
  },
  task: {
    label: 'task',
    args: ['--version'],
    min: '3',
    install: 'https://taskfile.dev/installation/',
  },
  cargo: {
    label: 'Rust (cargo)',
    args: ['--version'],
    min: '1.77',
    install: 'https://www.rust-lang.org/tools/install',
  },
  k6: {
    label: 'k6',
    args: ['version'],
    min: '0.4',
    install: 'https://grafana.com/docs/k6/latest/set-up/install-k6/',
  },
}

/** Tools every selected workspace needs, whatever the selection is. */
const BASE_TOOLS = ['node', 'pnpm', 'git']

/**
 * Extra tooling a specific workspace needs. `required` blocks that workspace's own scripts;
 * `optional` only blocks part of them, so a miss is reported as a warning.
 */
const WORKSPACE_TOOLS = {
  '@bitrate/api': { required: [], optional: ['docker', 'task'] },
  '@bitrate/desktop': { required: ['cargo'], optional: [] },
  '@bitrate/performance-test': { required: [], optional: ['k6'] },
}

const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
  usage()
  process.exit(0)
}

const workspaces = discoverWorkspaces()

if (args.includes('--list')) {
  for (const ws of workspaces) console.log(`${short(ws.name).padEnd(20)} ${ws.dir}`)
  process.exit(0)
}

const selectors = args.filter((a) => !a.startsWith('-'))
const selected = select(workspaces, selectors)

if (selected.length === 0) {
  console.error(`No workspace matches ${selectors.join(', ')}. Run with --list to see the names.`)
  process.exit(2)
}

const failures = []
const warnings = []

/* ---------------------------------------------------------------- toolchain */

const requiredTools = new Set(BASE_TOOLS)
const optionalTools = new Set()

for (const ws of selected) {
  const extra = WORKSPACE_TOOLS[ws.name]
  if (!extra) continue
  for (const t of extra.required) requiredTools.add(t)
  for (const t of extra.optional) if (!requiredTools.has(t)) optionalTools.add(t)
}

heading(`Toolchain — for ${selected.length} of ${workspaces.length} workspaces`)

for (const name of [...requiredTools, ...optionalTools]) {
  const optional = !requiredTools.has(name)
  const spec = TOOLS[name]
  const found = detect(name, spec.args)

  if (!found) {
    const note = `not found — ${spec.install}`
    if (optional) {
      warnings.push(`${spec.label}: ${note}`)
      line('warn', spec.label, '—', note)
    } else {
      failures.push(`${spec.label}: ${note}`)
      line('fail', spec.label, '—', note)
    }
    continue
  }

  const want = spec.exact ? `= ${spec.exact}` : `>= ${spec.min}`
  const ok = spec.exact ? found.version === spec.exact : gte(found.version, spec.min)
  const where = found.host ? ' (host, via flatpak-spawn)' : ''

  if (ok) {
    line('ok', spec.label, found.version, `${want}${where}`)
  } else {
    const note = `${want}${spec.source ? ` — ${spec.source}` : ''}`
    if (optional) {
      warnings.push(`${spec.label} ${found.version}, expected ${want}`)
      line('warn', spec.label, found.version, note)
    } else {
      failures.push(`${spec.label} ${found.version}, expected ${want}`)
      line('fail', spec.label, found.version, note)
    }
  }
}

/* ------------------------------------------------------------- dependencies */

heading('Dependencies')

if (!existsSync(join(ROOT, 'node_modules'))) {
  failures.push('node_modules is missing at the repository root — run `pnpm install`')
  line('fail', 'root', '—', 'node_modules missing — run `pnpm install`')
}

for (const ws of selected) {
  const declared = [
    ...Object.keys(ws.pkg.dependencies ?? {}),
    ...Object.keys(ws.pkg.devDependencies ?? {}),
  ]
  const missing = declared.filter((dep) => !resolves(dep, join(ROOT, ws.dir)))

  if (missing.length === 0) {
    line('ok', short(ws.name), `${declared.length} deps`, 'installed')
  } else {
    failures.push(`${ws.name}: ${missing.length} dependencies missing — run \`pnpm install\``)
    line('fail', short(ws.name), `${missing.length} missing`, missing.slice(0, 4).join(', '))
  }
}

/* -------------------------------------------------------------------- verdict */

console.log('')

if (failures.length === 0 && warnings.length === 0) {
  console.log(green('Environment is ready.'))
  process.exit(0)
}

for (const w of warnings) console.log(`${yellow('warning')}  ${w}`)
for (const f of failures) console.log(`${red('blocked')}  ${f}`)

console.log('')

if (failures.length === 0) {
  console.log(`Environment is usable; ${warnings.length} optional item(s) unavailable.`)
  process.exit(0)
}

process.exit(1)

/* ------------------------------------------------------------------ helpers */

function usage() {
  console.log(`Checks that this machine can build and run the repository.

  pnpm check:env                 every workspace
  pnpm check:env api ui-react    only the named ones
  pnpm check:env --list          show the workspace names

Exit code is 1 when something required is missing, 0 when only optional tooling is.`)
}

function discoverWorkspaces() {
  const found = []

  for (const group of ['apps', 'packages']) {
    const base = join(ROOT, group)
    if (!existsSync(base)) continue

    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const manifest = join(base, entry.name, 'package.json')
      if (!existsSync(manifest)) continue
      found.push({
        name: readJson(manifest).name,
        dir: `${group}/${entry.name}`,
        pkg: readJson(manifest),
      })
    }
  }

  return found.sort((a, b) => a.name.localeCompare(b.name))
}

function select(all, selectors) {
  if (selectors.length === 0) return all
  return all.filter((ws) =>
    selectors.some((s) => ws.name === s || short(ws.name) === s || ws.dir === s),
  )
}

function short(name) {
  return name.replace(/^@bitrate\//, '')
}

/**
 * Mirrors Node's own lookup by walking `node_modules` up to the repository root. The repo sets
 * `node-linker=hoisted`, so a workspace's dependencies mostly live in the root `node_modules`
 * rather than beside its package.json — checking only the workspace's own folder would report
 * almost everything as missing.
 */
function resolves(dep, fromDir) {
  let dir = fromDir

  for (;;) {
    if (existsSync(join(dir, 'node_modules', dep))) return true
    if (dir === ROOT) return false

    const parent = dirname(dir)
    if (parent === dir) return false
    dir = parent
  }
}

/**
 * Looks the tool up in this shell, then on the host. Under the VS Code Flatpak the shell's `/usr`
 * is the runtime's, so host-installed tools like docker are reachable only through
 * `flatpak-spawn` — reporting them as absent would be wrong.
 */
function detect(command, commandArgs) {
  const direct = run(command, commandArgs)
  if (direct) return { version: parseVersion(direct), host: false }

  const viaHost = run('flatpak-spawn', ['--host', command, ...commandArgs])
  if (viaHost) return { version: parseVersion(viaHost), host: true }

  return null
}

function run(command, commandArgs) {
  try {
    return execFileSync(command, commandArgs, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 15_000,
    })
  } catch {
    return null
  }
}

function parseVersion(output) {
  const match = output.match(/(\d+)\.(\d+)(?:\.(\d+))?/)
  return match ? match[0] : output.trim().split('\n')[0]
}

function gte(actual, minimum) {
  const a = actual.split('.').map(Number)
  const b = minimum.split('.').map(Number)

  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const left = a[i] ?? 0
    const right = b[i] ?? 0
    if (left > right) return true
    if (left < right) return false
  }

  return true
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function paint(code, text) {
  return useColor ? `\u001b[${code}m${text}\u001b[0m` : text
}

function green(t) {
  return paint('32', t)
}

function red(t) {
  return paint('31', t)
}

function yellow(t) {
  return paint('33', t)
}

function heading(text) {
  console.log(`\n${paint('1', text)}`)
}

function line(state, label, value, note) {
  const mark = { ok: green('ok  '), warn: yellow('warn'), fail: red('fail') }[state]
  console.log(`  ${mark}  ${label.padEnd(22)} ${String(value).padEnd(14)} ${note}`)
}
