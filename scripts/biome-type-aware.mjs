#!/usr/bin/env node
/**
 * Merges biome.ci.json into biome.json so Biome's type-aware nursery rules run.
 *
 * These two rules (noFloatingPromises, noMisusedPromises) need Biome to build the whole
 * monorepo's type graph, which costs ~1.3 GB of RSS and ~10s against ~220 MB and ~0.5s
 * without them. That price is fine for a CI job and painful for the editor's LSP, which
 * reloads it on every project open, so biome.json ships without them.
 *
 * The force-ignore entry for node_modules in biome.json's files.includes (the double-bang
 * prefix, which keeps the scanner out as well as the linter) takes ~210 MB off that 1.3 GB.
 * Both rules and organizeImports were verified to report identically with and without it.
 *
 * The overlay has to land in biome.json specifically, not be passed via --config-path: all
 * seven workspace configs declare `extends: ["../../biome.json"]`, so a rule that is not in
 * that file never reaches apps/api, apps/web-*, packages/ui-react, packages/tailwind,
 * packages/contracts or packages/ncs-parser. --config-path would only cover the workspaces
 * that have no nested config of their own.
 *
 * CI-only: it rewrites a tracked file, so never run it on a working tree you intend to keep.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const ROOT = new URL('../', import.meta.url)
const base = new URL('biome.json', ROOT)
const overlay = new URL('biome.ci.json', ROOT)

const read = (url) => {
  try {
    return JSON.parse(readFileSync(url, 'utf8'))
  } catch (cause) {
    throw new Error(`cannot read ${url.pathname}: ${cause.message}`, { cause })
  }
}

const config = read(base)
const { linter: { rules: added = {} } = {} } = read(overlay)

config.linter ??= {}
config.linter.rules ??= {}
for (const [group, rules] of Object.entries(added)) {
  config.linter.rules[group] = { ...config.linter.rules[group], ...rules }
}

writeFileSync(base, `${JSON.stringify(config, null, 2)}\n`)

// JSON.stringify always expands arrays onto one line each; Biome keeps short ones inline, so the
// re-serialised file would fail the `biome ci` format check. Hand it to the real formatter rather
// than reproducing its array heuristics here.
execFileSync('pnpm', ['exec', 'biome', 'format', '--write', 'biome.json'], {
  cwd: ROOT,
  stdio: 'inherit',
})

const names = Object.entries(added).flatMap(([group, rules]) =>
  Object.keys(rules).map((rule) => `${group}/${rule}`),
)
console.log(`biome.json: enabled type-aware rules -> ${names.join(', ')}`)
