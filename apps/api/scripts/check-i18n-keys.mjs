#!/usr/bin/env node
/**
 * Fails the build on i18n dictionary drift for `apps/api/src/i18n/`:
 *
 *   1. Every dotted key present in `en/*.json` exists in `uk/*.json`, and vice versa.
 *   2. Every `errors.*`/`validation.*` string literal referenced anywhere in `src/` resolves
 *      in BOTH dictionaries — a key deleted from the JSON but still thrown from a service
 *      lints clean, type-checks clean, and renders a raw key to the user; this is the check
 *      that catches it.
 *
 * No dependencies beyond Node's own `fs`/`path`, so it runs in CI with no extra install step.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const apiRoot = join(__dirname, '..')
const i18nRoot = join(apiRoot, 'src', 'i18n')
const srcRoot = join(apiRoot, 'src')
const LOCALES = ['en', 'uk']

/** Flattens a nested JSON object into dotted keys, e.g. `{ a: { b: 1 } }` -> `["a.b"]`. */
function flattenKeys(node, prefix = []) {
  if (typeof node !== 'object' || node === null) return [prefix.join('.')]
  return Object.entries(node).flatMap(([key, value]) => flattenKeys(value, [...prefix, key]))
}

/** Reads every `*.json` file in one locale directory, namespaced by filename. */
function loadLocale(locale) {
  const dir = join(i18nRoot, locale)
  const keys = new Set()
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const namespace = file.replace(/\.json$/, '')
    const data = JSON.parse(readFileSync(join(dir, file), 'utf8'))
    for (const key of flattenKeys(data)) keys.add(`${namespace}.${key}`)
  }
  return keys
}

/** Recursively lists every `.ts` file under `dir`, skipping spec/test files and dictionaries. */
function listSourceFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      if (entry === 'i18n') continue
      out.push(...listSourceFiles(full))
    } else if (entry.endsWith('.ts') && !entry.includes('spec')) {
      out.push(full)
    }
  }
  return out
}

/** Every `errors.*` / `validation.*` string literal used as a translation key in `src/`. */
function findReferencedKeys() {
  const pattern = /['"`](errors\.[a-zA-Z0-9_.]+|validation\.[a-zA-Z0-9_.]+)['"`]/g
  const referenced = new Map()
  for (const file of listSourceFiles(srcRoot)) {
    const content = readFileSync(file, 'utf8')
    for (const match of content.matchAll(pattern)) {
      const key = match[1]
      if (!referenced.has(key)) referenced.set(key, relative(apiRoot, file))
    }
  }
  return referenced
}

function main() {
  const dictionaries = Object.fromEntries(LOCALES.map((locale) => [locale, loadLocale(locale)]))
  const failures = []

  for (const locale of LOCALES) {
    const others = LOCALES.filter((l) => l !== locale)
    for (const other of others) {
      for (const key of dictionaries[locale]) {
        if (!dictionaries[other].has(key)) {
          failures.push(`"${key}" exists in ${locale}/ but is missing from ${other}/`)
        }
      }
    }
  }

  const referenced = findReferencedKeys()
  for (const [key, file] of referenced) {
    for (const locale of LOCALES) {
      if (!dictionaries[locale].has(key)) {
        failures.push(`"${key}" is referenced in ${file} but missing from ${locale}/`)
      }
    }
  }

  if (failures.length > 0) {
    console.error(`i18n key drift — ${failures.length} problem(s):\n`)
    for (const failure of failures) console.error(`  - ${failure}`)
    process.exit(1)
  }

  console.log(
    `i18n keys OK — ${dictionaries.en.size} keys, ${LOCALES.length} locales, ${referenced.size} referenced keys, all resolved.`,
  )
}

main()
