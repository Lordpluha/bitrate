#!/usr/bin/env node
/**
 * Fails when `apps/admin/src` references a Transloco key that `public/assets/i18n/en.json` or
 * `uk.json` does not define, or when the two translation files disagree on which keys exist.
 *
 * Transloco's `TranslocoHttpLoader` resolves a missing key to an empty string at runtime — no
 * build error, no lint error, no failing unit test, since every spec provides its own inline
 * `langs` fixture rather than loading the real JSON files. A renamed or newly-added key
 * therefore drifts silently until an operator sees a blank label in production. This is the
 * i18n-key equivalent of `scripts/check-design-tokens.mjs`: a source scan that catches what the
 * mechanical gates (lint/types/tests) structurally cannot.
 *
 * Two extraction patterns, because this codebase carries keys two ways:
 *  - Direct: `'nav.overview' | transloco`, `translate('login.failure')`,
 *    `translateSignal('locale.ariaLabel', ...)`, and a ternary of two literal keys piped through
 *    `transloco` (`(a() ? 'x.y' : 'x.z') | transloco`).
 *  - Indirect: a `label`/`label?` object-literal property in a `.ts` data file (e.g.
 *    `nav.model.ts`) holding a key string rather than display text — every such property in this
 *    codebase carries a `A '<prefix>.*' transloco key` TSDoc note, which is what this script's
 *    KEY_LIKE pattern is standing in for. A string here is only ever treated as a key candidate
 *    when it matches the dotted-path shape; plain display text (no dot, or containing a space)
 *    is never mistaken for one.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'src')
const I18N_DIR = join(ROOT, 'public', 'assets', 'i18n')
const LANGS = ['en', 'uk']

const EXEMPT = /\.unit-spec\.[jt]sx?$/

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) yield* walk(path)
    else if (/\.(ts|html)$/.test(path) && !EXEMPT.test(path)) yield path
  }
}

/** A dotted key path, e.g. `nav.section.operations` — never plain display text. */
const KEY_LIKE = /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)+$/

const DIRECT_PATTERNS = [
  /'([a-zA-Z][a-zA-Z0-9.]*)'\s*\|\s*transloco/g,
  /\btranslate\(\s*'([a-zA-Z][a-zA-Z0-9.]*)'/g,
  /\btranslateSignal\(\s*\n?\s*'([a-zA-Z][a-zA-Z0-9.]*)'/g,
]

/** Catches both arms of `(cond ? 'a.b' : 'c.d') | transloco` on one line. */
const TERNARY_PATTERN = /\?\s*'([a-zA-Z][a-zA-Z0-9.]*)'\s*:\s*'([a-zA-Z][a-zA-Z0-9.]*)'\s*\)\s*\|\s*transloco/g

/** `label: 'nav.foo'` / `label?: 'nav.foo'` in a data file — see the file header. */
const LABEL_PROPERTY_PATTERN = /\blabel\??:\s*'([a-zA-Z][a-zA-Z0-9.]*)'/g

function extractKeys(source) {
  const keys = new Set()

  for (const pattern of DIRECT_PATTERNS) {
    for (const match of source.matchAll(pattern)) keys.add(match[1])
  }
  for (const match of source.matchAll(TERNARY_PATTERN)) {
    keys.add(match[1])
    keys.add(match[2])
  }
  for (const match of source.matchAll(LABEL_PROPERTY_PATTERN)) {
    if (KEY_LIKE.test(match[1])) keys.add(match[1])
  }

  return keys
}

function flatten(obj, prefix = '') {
  const keys = []
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value !== null && typeof value === 'object') keys.push(...flatten(value, path))
    else keys.push(path)
  }
  return keys
}

const usedKeys = new Map()
for (const file of walk(SRC)) {
  const source = readFileSync(file, 'utf8')
  for (const key of extractKeys(source)) {
    if (!usedKeys.has(key)) usedKeys.set(key, file)
  }
}

const definedByLang = {}
for (const lang of LANGS) {
  const path = join(I18N_DIR, `${lang}.json`)
  let parsed
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    console.error(`✗ could not read/parse ${path}: ${error.message}`)
    process.exit(1)
  }
  definedByLang[lang] = new Set(flatten(parsed))
}

const missing = []
for (const [key, file] of usedKeys) {
  for (const lang of LANGS) {
    if (!definedByLang[lang].has(key)) missing.push({ key, lang, file })
  }
}

const mismatched = []
const [firstLang, ...restLangs] = LANGS
for (const key of definedByLang[firstLang]) {
  for (const lang of restLangs) {
    if (!definedByLang[lang].has(key)) mismatched.push({ key, missingFrom: lang })
  }
}
for (const lang of restLangs) {
  for (const key of definedByLang[lang]) {
    if (!definedByLang[firstLang].has(key)) mismatched.push({ key, missingFrom: firstLang })
  }
}

if (missing.length === 0 && mismatched.length === 0) {
  console.log(`✅ i18n keys: ${usedKeys.size} key(s) referenced, all defined in ${LANGS.join('/')}.json`)
  process.exit(0)
}

if (missing.length > 0) {
  console.error(`✗ ${missing.length} referenced key(s) missing from a translation file:\n`)
  for (const m of missing) console.error(`  ${m.key}  (used in ${m.file}, missing from ${m.lang}.json)`)
}

if (mismatched.length > 0) {
  console.error(`\n✗ ${mismatched.length} key(s) defined in one translation file but not the other:\n`)
  for (const m of mismatched) console.error(`  ${m.key}  (missing from ${m.missingFrom}.json)`)
}

console.error(`
A key referenced in apps/admin/src must exist in every public/assets/i18n/<lang>.json — a
missing one resolves to an empty string at runtime with no build or test failure. Add the key
to whichever file(s) are missing it.`)

process.exit(1)
