#!/usr/bin/env node
/**
 * Rebinds a Pencil design to the single Bitrate palette: one palette, three themes (Dark, Light,
 * Dim). Every hardcoded hex colour and every file-local colour variable is replaced by the
 * nearest library variable, chosen per theme — a node inside a Light section is matched against
 * the Light values of the tokens, composited over the Light page background.
 *
 *   node scripts/bind-pen-colors.mjs <file.pen> [...] [--report]
 *
 * For each file it: imports the library as `ds` (the library itself binds to its own `$--x`),
 * maps local `color-*` variables to `$ds:--*` (by name, else by nearest value), replaces hex
 * colours by role — text/icon fills against text roles, surface fills against surface roles,
 * strokes against border roles and shadows against the shadow/scrim roles — then deletes the file's own colour variables and moves node themes onto
 * the library's `Mode` axis. Fully transparent gradient stops (#rrggbb00) carry no colour and
 * are left as they are. `--report` prints the matches without writing.
 *
 * Matching is perceptual (OKLab, chroma weighted ×2 so a hue is never traded for a grey), with
 * semantic roles preferred over raw palette steps. It is a migration aid: review the result.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'

const ROOT = join(dirname(new URL(import.meta.url).pathname), '..')
const LIBRARY = join(ROOT, 'pencil/web-player-design/design-system/bitrate.lib.pen')
const THEMES = ['Dark', 'Light', 'Dim']
const BACKGROUND = { Dark: '#0B0D12', Light: '#FFFFFF', Dim: '#0E1117' }

const lib = JSON.parse(readFileSync(LIBRARY, 'utf8')).variables

/* ---------- colour maths ---------- */

const parse = (hex) => {
  let h = hex.slice(1)
  if (h.length <= 4) h = [...h].map((c) => c + c).join('')
  const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 }
}
const over = (c, bg) => ({
  r: c.r * c.a + bg.r * (1 - c.a),
  g: c.g * c.a + bg.g * (1 - c.a),
  b: c.b * c.a + bg.b * (1 - c.a),
})
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const oklab = ({ r, g, b }) => {
  const [R, G, B] = [r, g, b].map(lin)
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B)
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B)
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}
const distance = (a, b) => Math.hypot(a[0] - b[0], 2 * (a[1] - b[1]), 2 * (a[2] - b[2]))

/* ---------- library tokens per theme ---------- */

const rawValue = (name, theme) => {
  const v = lib[name].value
  return Array.isArray(v) ? v.find((x) => x.theme.Mode === theme).value : v
}
const resolve = (name, theme) => {
  const v = rawValue(name, theme)
  return v.startsWith('$') ? resolve(v.slice(1), theme) : v
}
const PALETTE = /^--(neutral|purple|blue|green|amber|red|grey|magenta|white|black)(-|$)/
const EXCLUDED = /^--(auth-|brand-|scrollbar|chart-|browse-|sidebar)/
const TOKENS = {}
for (const theme of THEMES) {
  const bg = parse(BACKGROUND[theme])
  TOKENS[theme] = Object.keys(lib)
    .filter((k) => lib[k].type === 'color' && !EXCLUDED.test(k))
    .map((k) => {
      const c = parse(resolve(k, theme))
      return { name: k, alpha: c.a, lab: oklab(over(c, bg)), palette: PALETTE.test(k) }
    })
}

/** Roles a colour may bind to, by where it is painted. Palette steps are a penalised fallback. */
const POOLS = {
  text: /^--(foreground|foreground-secondary|muted-foreground|text|text-secondary|text-subdued|text-muted|primary|accent|primary-foreground|(info|success|warning|error)(-text)?|magenta-500)$/,
  surface:
    /^--(background|background-secondary|background-elevated|background-tinted|background-highlight|card|popover|muted|secondary|primary|primary-hover|primary-active|accent|surface|surface-hover|surface-active|scrim|hero-wash|gradient-[a-z-]+)$/,
  stroke:
    /^--(border|border-subtle|input|ring|primary|accent|surface|surface-active|(info|success|warning|error)-border)$/,
  shadow: /^--(shadow|scrim)$/,
}
const PALETTE_PENALTY = 0.05

function nearest(hex, pool, theme) {
  const c = parse(hex)
  const target = oklab(over(c, parse(BACKGROUND[theme])))
  let best = null
  for (const t of TOKENS[theme]) {
    const inPool = POOLS[pool].test(t.name)
    if (!inPool && (!t.palette || pool === 'shadow')) continue
    const d =
      distance(target, t.lab) +
      (inPool ? 0 : pool === 'text' ? 2 * PALETTE_PENALTY : PALETTE_PENALTY) +
      Math.abs(c.a - t.alpha) * 0.03
    if (!best || d < best.d) best = { name: t.name, d }
  }
  return best
}

/* ---------- one file ---------- */

const HEX = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
const isTransparent = (hex) => hex.length === 9 && /00$/i.test(hex)
const themeOf = (theme) => {
  const v = theme?.Mode ?? theme?.mode ?? theme?.['ds:Mode']
  return v ? v[0].toUpperCase() + v.slice(1).toLowerCase() : undefined
}
const poolForVariable = (name) =>
  /(^|-)(text|ink|foreground|muted$|on-)/.test(name)
    ? 'text'
    : /border|ring|input/.test(name)
      ? 'stroke'
      : 'surface'

function bindFile(file, report) {
  const isLibrary = file === LIBRARY
  const prefix = isLibrary ? '$' : '$ds:'
  /** An importing file sees the library's axis under its alias: `ds:Mode`, not `Mode`. */
  const themeKey = isLibrary ? 'Mode' : 'ds:Mode'
  const doc = JSON.parse(readFileSync(file, 'utf8'))
  const local = doc.variables ?? {}
  const stats = new Map()

  const bindHex = (hex, pool, theme) => {
    if (isTransparent(hex)) return hex
    const hit = nearest(hex.toUpperCase(), pool, theme)
    const key = `${hex.toUpperCase()} ${pool} ${theme}`
    const s = stats.get(key) ?? { ...hit, n: 0 }
    s.n++
    stats.set(key, s)
    return `${prefix}${hit.name}`
  }

  /* file-local colour variables → library variables */
  const variableMap = {}
  if (!isLibrary) {
    for (const [name, def] of Object.entries(local)) {
      if (def.type !== 'color') continue
      const same = `--${name.replace(/^color-/, '')}`
      if (lib[same]?.type === 'color') {
        variableMap[`$${name}`] = `${prefix}${same}`
        continue
      }
      const values = Array.isArray(def.value) ? def.value : [{ value: def.value }]
      const pick =
        values.find((v) => themeOf(v.theme) === (name.startsWith('white-') ? 'Light' : 'Dark')) ??
        values[0]
      const hex = HEX.test(pick.value) ? pick.value : null
      variableMap[`$${name}`] = hex
        ? bindHex(hex, poolForVariable(name), themeOf(pick.theme) ?? 'Dark')
        : `${prefix}--foreground`
    }
  }

  const paint = (fill, pool, theme) => {
    if (Array.isArray(fill)) return fill.map((f) => paint(f, pool, theme))
    if (typeof fill === 'string')
      return HEX.test(fill) ? bindHex(fill, pool, theme) : (variableMap[fill] ?? fill)
    if (fill?.type === 'color') return { ...fill, color: paint(fill.color, pool, theme) }
    if (fill?.type === 'gradient') {
      return {
        ...fill,
        colors: fill.colors.map((s) => ({ ...s, color: paint(s.color, 'surface', theme) })),
      }
    }
    if (fill?.type === 'mesh_gradient')
      return { ...fill, colors: fill.colors.map((c) => paint(c, 'surface', theme)) }
    return fill
  }
  const effect = (e, theme) => {
    if (Array.isArray(e)) return e.map((x) => effect(x, theme))
    if (e && typeof e === 'object' && typeof e.color === 'string')
      return { ...e, color: paint(e.color, 'shadow', theme) }
    return e
  }
  /** A file-local variable's default (first) value, so a `$color-x` fill can be judged light or dark. */
  /* Only a file-local palette is judged by value; the library's own variables are already themed. */
  const localHex = (ref) => {
    if (isLibrary) return undefined
    const def = typeof ref === 'string' && ref.startsWith('$') ? local[ref.slice(1)] : undefined
    const v = Array.isArray(def?.value) ? def.value[0].value : def?.value
    return typeof v === 'string' && HEX.test(v) ? v : undefined
  }
  /**
   * Section frames that never declared a theme but are painted light or dark get one, so their
   * colours bind to the semantic role of that theme (a white section binds to Light `--background`,
   * not to the theme-invariant `--white`) and keep following the theme switch afterwards.
   */
  const inferTheme = (node) => {
    if (node.type !== 'frame' || !Array.isArray(node.children) || node.children.length === 0)
      return undefined
    const toHex = (v) => (typeof v === 'string' ? (HEX.test(v) ? v : localHex(v)) : undefined)
    const stops =
      node.fill?.type === 'gradient'
        ? node.fill.colors.map((s) => toHex(s.color))
        : [toHex(node.fill)]
    const opaque = stops.filter((h) => h && parse(h).a >= 0.95)
    if (opaque.length === 0 || opaque.length < stops.length) return undefined
    const L = opaque.reduce((sum, h) => sum + oklab(parse(h))[0], 0) / opaque.length
    return L > 0.75 ? 'Light' : L < 0.3 ? 'Dark' : undefined
  }
  const walk = (node, type, theme, explicit) => {
    if (Array.isArray(node)) return node.map((n) => walk(n, type, theme, explicit))
    if (typeof node === 'string') return variableMap[node] ?? node
    if (!node || typeof node !== 'object') return node
    const t = node.type ?? type
    const own = themeOf(node.theme)
    /* A declared theme stands unless the frame's own paint contradicts it (a light-painted
       section still tagged dark): then the paint is the truth and the tag is corrected. */
    const painted = inferTheme(node)
    const inferred = own
      ? painted && painted !== own
        ? painted
        : undefined
      : explicit
        ? undefined
        : painted
    const th = inferred ?? own ?? theme
    const out = {}
    for (const [k, v] of Object.entries(node)) {
      if (k === 'fill')
        out[k] = paint(v, ['text', 'icon', 'path'].includes(t) ? 'text' : 'surface', th)
      else if (k === 'stroke') out[k] = paint(v, 'stroke', th)
      else if (k === 'effect') out[k] = effect(v, th)
      else if (k === 'theme' && own) out[k] = { [themeKey]: inferred ?? own }
      else out[k] = walk(v, t, th, explicit || Boolean(own || inferred))
    }
    if (inferred) out.theme = { [themeKey]: inferred }
    return out
  }

  const children = walk(doc.children, undefined, 'Dark', false)
  const rows = [...stats.values()]
  const tokens = new Set(rows.map((r) => r.name))
  const uses = rows.reduce((n, r) => n + r.n, 0)
  const rel = relative(ROOT, file)
  console.log(
    `${rel}: ${uses} hex use(s) → ${tokens.size} token(s); ${Object.keys(variableMap).length} local colour variable(s) remapped`,
  )
  if (report) {
    for (const [key, s] of [...stats.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 25)) {
      console.log(`  ${key} → ${s.name} (${s.d.toFixed(3)}) ×${s.n}`)
    }
    return
  }

  const next = { version: doc.version }
  if (!isLibrary) next.imports = { ...doc.imports, ds: relative(dirname(file), LIBRARY) }
  const keptVariables = Object.fromEntries(
    Object.entries(local).filter(([, d]) => isLibrary || d.type !== 'color'),
  )
  const usesLocalThemes = Object.values(keptVariables).some((d) => Array.isArray(d.value))
  if (isLibrary || usesLocalThemes) next.themes = doc.themes
  if (Object.keys(keptVariables).length) next.variables = keptVariables
  for (const [k, v] of Object.entries(doc))
    if (!(k in next) && !['children', 'themes', 'variables'].includes(k)) next[k] = v
  next.children = children
  writeFileSync(file, JSON.stringify(next, null, 2))
}

const args = process.argv.slice(2)
const report = args.includes('--report')
const files = args.filter((a) => !a.startsWith('--'))
if (files.length === 0) {
  console.error('usage: node scripts/bind-pen-colors.mjs <file.pen> [...] [--report]')
  process.exit(2)
}
for (const f of files)
  bindFile(join(process.cwd(), f) === LIBRARY ? LIBRARY : join(process.cwd(), f), report)
