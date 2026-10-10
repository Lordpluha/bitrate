#!/usr/bin/env node
/**
 * Keeps the Pencil design library's colour variables identical to the code's colour tokens.
 *
 * packages/tailwind/src is the token source (see .claude/rules/design-tokens.md). This script
 * walks themes.css's @import chain, resolves every `--color-*` role for the Dark (@theme), Light
 * (:root.light) and Dim (:root.dim, inheriting Dark) themes, and writes them into
 * bitrate.lib.pen as `--<role>` variables on its `Mode` theme axis — so `bg-card` in code and
 * `$ds:--card` in a design are the same value by construction. A role whose CSS value is a bare
 * `var(--color-x)` stays a `$--x` alias, so the design keeps the code's alias chain.
 *
 *   node scripts/sync-pen-tokens.mjs           write the library
 *   node scripts/sync-pen-tokens.mjs --check   fail on drift, unknown `$ds:` references, or
 *                                              hardcoded hex colours in any design
 *
 * Every design under pencil/ follows one rule: ONE palette, THREE themes (Dark, Light, Dim). A
 * design imports the library as `ds`, paints only with its variables, and defines no colour
 * variables of its own — a file-local palette is a second palette. `scripts/bind-pen-colors.mjs`
 * migrates a design that breaks the rule. Screens are assembled, not drawn: outside the library a
 * design holds only library instances, layout-only frames and content overrides.
 *
 * Only semantic roles and the palette are exported — component roles (`themes/components/*`) stay
 * in code, as in shadcn. Non-colour library variables (spacing, radius, fonts) are design-owned
 * and left untouched.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'

const ROOT = join(dirname(new URL(import.meta.url).pathname), '..')
const THEMES_ENTRY = join(ROOT, 'packages/tailwind/src/themes.css')
const LIBRARY = join(ROOT, 'pencil/web-player-design/design-system/bitrate.lib.pen')
const DESIGNS = join(ROOT, 'pencil')
/**
 * Designs drawn before the "assembled from library components only" rule. They are reported as
 * warnings until they are rebuilt from library instances; every other design must comply.
 */
const LEGACY = [/^pencil\/web-artist/, /^pencil\/web-player-design\/landing\//]
/** Archived designs are historical references, not live designs: the checks skip them. */
const ARCHIVED = /^pencil\/web-player-design\/archive\//
const SHAPES = new Set(['text', 'icon', 'rectangle', 'ellipse', 'path', 'polygon', 'line'])
const VISUAL = ['fill', 'stroke', 'effect', 'cornerRadius']

/** Counts children placed by coordinates instead of flex: free frames, groups, absolute nodes. */
function absoluteLayout(doc) {
  let count = 0
  const visit = (node) => {
    if (Array.isArray(node)) {
      for (const n of node) visit(n)
      return
    }
    if (!node || typeof node !== 'object') return
    if (
      (node.type === 'frame' && node.layout === 'none' && node.children?.length) ||
      node.type === 'group'
    )
      count++
    if (node.layoutPosition === 'absolute') count++
    for (const c of node.children ?? []) visit(c)
    if (node.type === 'ref')
      for (const v of Object.values(node.descendants ?? {})) if (v?.type) visit(v)
  }
  for (const t of doc.children) visit(t.children ?? [])
  return count
}

/** Counts elements a screen draws itself instead of instancing a library component. */
function localElements(doc) {
  let count = 0
  const visit = (node, top) => {
    if (Array.isArray(node)) {
      for (const n of node) visit(n, false)
      return
    }
    if (!node || typeof node !== 'object') return
    if (node.type === 'ref') {
      for (const v of Object.values(node.descendants ?? {})) if (v?.type) visit(v, false)
      return
    }
    if (SHAPES.has(node.type)) count++
    else if (!top && VISUAL.some((k) => k in node)) count++
    for (const c of node.children ?? []) visit(c, false)
  }
  for (const t of doc.children) visit(t, true)
  return count
}
const LIBRARY_ALIAS = 'ds'
const THEMES = ['Dark', 'Light', 'Dim']
const SELECTORS = { '@theme': 'Dark', ':root.light': 'Light', ':root.dim': 'Dim' }

/* ---------- CSS → per-theme declarations ---------- */

function collectCss(file, seen = new Set()) {
  if (seen.has(file)) return ''
  seen.add(file)
  const css = readFileSync(file, 'utf8')
  return css.replace(/@import\s+"([^"]+)";/g, (_, path) =>
    collectCss(join(dirname(file), path), seen),
  )
}

function parseDeclarations(css) {
  const decls = { Dark: {}, Light: {}, Dim: {} }
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '')
  for (const [, selector, body] of clean.matchAll(
    /(@theme(?:\s+inline)?|:root\.light|:root\.dim)\s*\{([^}]*)\}/g,
  )) {
    const theme = SELECTORS[selector.replace(/\s+inline$/, '')]
    for (const [, name, value] of body.matchAll(/--color-([a-z0-9-]+)\s*:\s*([^;]+);/g)) {
      decls[theme][name] = value.trim()
    }
  }
  return decls
}

/** Dim layers on Dark; Light stands alone on top of Dark's palette-only defaults. */
function lookup(decls, theme, name) {
  if (decls[theme][name] !== undefined) return decls[theme][name]
  return decls.Dark[name]
}

/* ---------- colour maths ---------- */

const clamp01 = (x) => Math.min(1, Math.max(0, x))

function parseHex(hex) {
  let h = hex.slice(1)
  if (h.length <= 4) h = [...h].map((c) => c + c).join('')
  const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 }
}

function toHex({ r, g, b, a }) {
  const byte = (x) =>
    Math.round(clamp01(x) * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase()
  return `#${byte(r)}${byte(g)}${byte(b)}${a >= 0.999 ? '' : byte(a)}`
}

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const fromLinear = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

function oklabToRgb(L, A, B, alpha) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  return {
    r: fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    a: alpha,
  }
}

function rgbToOklab({ r, g, b }) {
  const [lr, lg, lb] = [r, g, b].map(toLinear)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

const parseAlpha = (s) =>
  s === undefined ? 1 : s.endsWith('%') ? parseFloat(s) / 100 : parseFloat(s)

/** Premultiplied interpolation, as CSS Color 5 specifies for color-mix(). */
function mix(space, c1, p1, c2) {
  const a = c1.a * p1 + c2.a * (1 - p1)
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 }
  const coords = (c) => (space === 'oklab' ? rgbToOklab(c) : [c.r, c.g, c.b])
  const [x1, x2] = [coords(c1), coords(c2)]
  const out = x1.map((v, i) => (v * c1.a * p1 + x2[i] * c2.a * (1 - p1)) / a)
  return space === 'oklab' ? oklabToRgb(...out, a) : { r: out[0], g: out[1], b: out[2], a }
}

/** Splits a function's argument list on top-level commas. */
function splitArgs(s) {
  const out = []
  let depth = 0
  let start = 0
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') depth++
    else if (s[i] === ')') depth--
    else if (s[i] === ',' && depth === 0) {
      out.push(s.slice(start, i).trim())
      start = i + 1
    }
  }
  out.push(s.slice(start).trim())
  return out
}

function resolveColor(decls, theme, value, trail = []) {
  value = value.trim()
  if (value === 'transparent') return { r: 0, g: 0, b: 0, a: 0 }
  if (value.startsWith('#')) return parseHex(value)
  const fn = value.match(/^([a-z-]+)\((.*)\)$/s)
  if (!fn) throw new Error(`unsupported colour "${value}" (${trail.join(' → ')})`)
  const [, name, body] = fn
  if (name === 'var') {
    const [ref, fallback] = splitArgs(body)
    const role = ref.replace(/^--color-/, '')
    if (trail.includes(role)) throw new Error(`cycle: ${[...trail, role].join(' → ')}`)
    const next = lookup(decls, theme, role) ?? fallback
    if (next === undefined) throw new Error(`undefined ${ref} (${trail.join(' → ')})`)
    return resolveColor(decls, theme, next, [...trail, role])
  }
  if (name === 'rgb' || name === 'rgba') {
    const [r, g, b, a] = body.split(/[\s,/]+/).filter(Boolean)
    return { r: r / 255, g: g / 255, b: b / 255, a: parseAlpha(a) }
  }
  if (name === 'oklch') {
    const [l, c, h, a] = body.split(/[\s/]+/).filter(Boolean)
    const L = l.endsWith('%') ? parseFloat(l) / 100 : parseFloat(l)
    const rad = (parseFloat(h) * Math.PI) / 180
    return oklabToRgb(L, c * Math.cos(rad), c * Math.sin(rad), parseAlpha(a))
  }
  if (name === 'color-mix') {
    const [space, first, second] = splitArgs(body)
    const part = (arg) => {
      const m = arg.match(/^(.*?)(?:\s+([\d.]+)%)?$/s)
      return { color: resolveColor(decls, theme, m[1], trail), pct: m[2] && parseFloat(m[2]) / 100 }
    }
    const [x, y] = [part(first), part(second)]
    const p1 = x.pct ?? (y.pct !== undefined ? 1 - y.pct : 0.5)
    return mix(space.replace(/^in\s+/, ''), x.color, p1, y.color)
  }
  throw new Error(`unsupported colour function ${name}() (${trail.join(' → ')})`)
}

/* ---------- code tokens → Pencil variables ---------- */

/**
 * Component roles (`themes/components/*`) stay in code: like shadcn, the design library exposes
 * the semantic roles and the palette, and components are built from those.
 */
function componentRoles() {
  const dir = join(dirname(THEMES_ENTRY), 'themes/components')
  const names = new Set()
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.css'))) {
    const decls = parseDeclarations(readFileSync(join(dir, f), 'utf8'))
    for (const theme of THEMES) for (const name of Object.keys(decls[theme])) names.add(name)
  }
  return names
}

function buildVariables() {
  const decls = parseDeclarations(collectCss(THEMES_ENTRY))
  const internal = componentRoles()
  const roles = Object.keys(decls.Dark).filter((r) => !internal.has(r))
  const variables = {}
  for (const role of roles) {
    const perTheme = THEMES.map((theme) => {
      const raw = lookup(decls, theme, role)
      const alias = raw.match(/^var\(--color-([a-z0-9-]+)\)$/)
      if (alias && decls.Dark[alias[1]] !== undefined) return `$--${alias[1]}`
      return toHex(resolveColor(decls, theme, raw, [role]))
    })
    const value = perTheme.every((v) => v === perTheme[0])
      ? perTheme[0]
      : perTheme.map((v, i) => ({ value: v, theme: { Mode: THEMES[i] } }))
    variables[`--${role}`] = { type: 'color', value }
  }
  for (const theme of ['Light', 'Dim']) {
    for (const role of Object.keys(decls[theme])) {
      if (decls.Dark[role] === undefined)
        throw new Error(`--color-${role} is set for ${theme} only`)
    }
  }
  return variables
}

/* ---------- design-file scan ---------- */

const HEX = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
/** Fully transparent stops (`#rrggbb00`) carry no colour, only the fade — they need no token. */
const isTransparent = (hex) => hex.length === 9 && hex.endsWith('00')

function* penFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* penFiles(path)
    else if (entry.name.endsWith('.pen')) yield path
  }
}

function scanDesign(file, libraryNames, refPattern) {
  const doc = JSON.parse(readFileSync(file, 'utf8'))
  const hex = new Map()
  const unknown = new Map()
  let wrongAxis = 0
  const visit = (node, frame) => {
    if (Array.isArray(node)) {
      for (const n of node) visit(n, frame)
      return
    }
    if (!node || typeof node !== 'object') return
    if (node.theme && (node.theme.Mode || node.theme.mode)) wrongAxis++
    for (const [key, value] of Object.entries(node)) {
      if (typeof value === 'string') {
        if (key !== 'url' && key !== 'content' && HEX.test(value) && !isTransparent(value)) {
          hex.set(frame, (hex.get(frame) ?? 0) + 1)
        }
        const ref = value.match(refPattern)
        if (ref && !libraryNames.has(ref[1])) unknown.set(ref[1], (unknown.get(ref[1]) ?? 0) + 1)
      } else visit(value, frame)
    }
  }
  for (const top of doc.children) visit(top, `${top.id} ${top.name ?? ''}`.trim())
  const ownColours = Object.entries(doc.variables ?? {}).filter(([, v]) => v.type === 'color')
  return {
    hex,
    unknown,
    imports: doc.imports ?? {},
    ownColours: ownColours.length,
    wrongAxis,
    local: localElements(doc),
    absolute: absoluteLayout(doc),
  }
}

/* ---------- main ---------- */

const check = process.argv.includes('--check')
const library = JSON.parse(readFileSync(LIBRARY, 'utf8'))
const generated = buildVariables()
const current = library.variables ?? {}
const designOnly = Object.keys(current).filter((k) => current[k].type === 'color' && !generated[k])

if (!check) {
  const next = {}
  for (const [name, v] of Object.entries(current)) if (v.type !== 'color') next[name] = v
  Object.assign(next, generated)
  library.themes = { ...library.themes, Mode: THEMES }
  library.variables = next
  writeFileSync(LIBRARY, JSON.stringify(library, null, 2))
  console.log(
    `✅ ${relative(ROOT, LIBRARY)}: ${Object.keys(generated).length} colour variables from code`,
  )
  if (designOnly.length) console.log(`   removed design-only colours: ${designOnly.join(', ')}`)
  process.exit(0)
}

const problems = []
const warnings = []
const drift = Object.keys(generated).filter(
  (k) => JSON.stringify(current[k]?.value) !== JSON.stringify(generated[k].value),
)
if (drift.length)
  problems.push(`library drifted from code for ${drift.length} role(s): ${drift.join(', ')}`)
if (designOnly.length) problems.push(`library colours with no code token: ${designOnly.join(', ')}`)

const libraryNames = new Set(Object.keys(generated).concat(Object.keys(current)))
for (const name of designOnly) libraryNames.delete(name)
const designs = [...penFiles(DESIGNS)]
for (const path of designs) {
  const file = relative(ROOT, path)
  if (ARCHIVED.test(file)) continue
  const isLibrary = path === LIBRARY
  const pattern = isLibrary
    ? /^\$(--[a-z0-9-]+)$/
    : new RegExp(`^\\$${LIBRARY_ALIAS}:(--[a-z0-9-]+)$`)
  const { hex, unknown, imports, ownColours, wrongAxis, local, absolute } = scanDesign(
    path,
    libraryNames,
    pattern,
  )
  if (absolute) {
    const line = `${file}: ${absolute} element(s) positioned by coordinates — lay them out with flex`
    if (LEGACY.some((r) => r.test(file))) warnings.push(line)
    else problems.push(line)
  }
  if (!isLibrary && local) {
    const line = `${file}: ${local} element(s) drawn locally instead of instancing a library component`
    if (LEGACY.some((r) => r.test(file))) warnings.push(line)
    else problems.push(line)
  }
  if (!isLibrary && wrongAxis)
    problems.push(
      `${file}: ${wrongAxis} theme(s) set on "Mode" — an importing file must use "ds:Mode"`,
    )
  if (!isLibrary && !imports[LIBRARY_ALIAS])
    problems.push(`${file}: does not import the library as "${LIBRARY_ALIAS}"`)
  if (!isLibrary && ownColours)
    problems.push(`${file}: defines ${ownColours} colour variable(s) of its own — a second palette`)
  for (const [name, count] of unknown)
    problems.push(`${file}: ${count}× ${name} is not a library variable`)
  for (const [frame, count] of hex)
    problems.push(`${file}: ${count} hardcoded hex colour(s) in "${frame}"`)
}

if (warnings.length)
  console.warn(
    `⚠ legacy designs to rebuild from library components with flex layout:\n${warnings.map((w) => `  ${w}`).join('\n')}`,
  )
if (problems.length === 0) {
  console.log(
    `✅ pen tokens: library matches code; ${designs.length} designs use one palette, three themes`,
  )
  process.exit(0)
}
console.error(`✗ pen tokens:\n${problems.map((p) => `  ${p}`).join('\n')}`)
console.error(
  '\nRun `pnpm design:tokens` to regenerate the library and `node scripts/bind-pen-colors.mjs <file>`\nto bind a design to it.',
)
process.exit(1)
