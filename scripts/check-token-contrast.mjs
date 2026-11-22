#!/usr/bin/env node
/**
 * Fails when a text/surface token pair misses WCAG 2.2 AA contrast (4.5:1) in any theme.
 *
 * The axe gates (ui-react stories, web-player and web-artists routes) only see pairs that some
 * story or page happens to render. This reads the token source instead: every
 * `--color-<role>-foreground` on its own surface (`--color-<role>` or `--color-<role>-surface`),
 * and the shared text roles on the shared surfaces, resolved through `var()` for the dark
 * (`@theme`), light (`:root.light`) and dim (`:root.dim`, inheriting dark) themes.
 *
 * Only opaque hex values are compared. A translucent value (rgba, `/alpha`) depends on what is
 * underneath, so its pair is reported as skipped, not passed.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const SRC = 'packages/tailwind/src'
const AA_TEXT = 4.5

/** Text roles that are written on the page's own surfaces. */
const TEXT_ROLES = [
  'foreground',
  'foreground-secondary',
  'muted-foreground',
  'text',
  'text-secondary',
  'text-subdued',
  'text-brand',
]
const SURFACES = ['background', 'background-secondary', 'card', 'popover']

/** Pairs outside the naming convention: [foreground, background]. */
const EXTRA_PAIRS = [
  ['text-contrast', 'contrast'],
  ['text-contrast-subdued', 'contrast'],
]

/** Pairs exempt from the text minimum, each with the reason. */
const EXEMPT = new Map([
  // Lowest-emphasis text is for disabled/placeholder copy, which WCAG 1.4.3 exempts.
  ['text-muted', 'disabled and placeholder copy only (WCAG 1.4.3 exception)'],
])

const cssFiles = () => {
  const files = [join(SRC, 'palette.css'), join(SRC, 'themes', 'base.css')]
  for (const dir of ['global', 'components']) {
    for (const name of readdirSync(join(SRC, 'themes', dir)).sort()) {
      if (name.endsWith('.css')) files.push(join(SRC, 'themes', dir, name))
    }
  }
  return files
}

/** Collects declarations per block kind: `@theme` (dark), `:root.light`, `:root.dim`. */
const readThemes = () => {
  const themes = { dark: new Map(), light: new Map(), dim: new Map() }
  const blockPattern = /(@theme(?:\s+inline)?|:root\.light|:root\.dim)\s*\{([^}]*)\}/g
  const declPattern = /--color-([\w-]+)\s*:\s*([^;]+);/g
  for (const file of cssFiles()) {
    const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    for (const [, selector, body] of css.matchAll(blockPattern)) {
      const target = selector.startsWith('@theme')
        ? themes.dark
        : selector.endsWith('light')
          ? themes.light
          : themes.dim
      for (const [, name, value] of body.matchAll(declPattern)) target.set(name, value.trim())
    }
  }
  return themes
}

/** Light and dim override dark; dim inherits every role it does not set (design-tokens rule). */
const themeLookup = (themes, theme) => (name) =>
  (theme !== 'dark' && themes[theme].get(name)) || themes.dark.get(name)

const resolve = (lookup, name, seen = new Set()) => {
  if (seen.has(name)) return null
  seen.add(name)
  const value = lookup(name)
  if (!value) return null
  const ref = value.match(/^var\(--color-([\w-]+)\)$/)
  return ref ? resolve(lookup, ref[1], seen) : value
}

const parseHex = (value) => {
  const match = value?.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!match) return null
  const hex = match[1].length === 3 ? [...match[1]].map((c) => c + c).join('') : match[1]
  return [0, 2, 4].map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255)
}

const luminance = (rgb) => {
  const [r, g, b] = rgb.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const themes = readThemes()
const roles = new Set([...themes.dark.keys(), ...themes.light.keys()])

/**
 * `<role>-foreground` is text on the solid `<role>` fill; a component role without that fill
 * (badges) pairs it with `<role>-surface`. Status callouts write `<role>-text` on their tinted
 * `<role>-surface` instead (global/status.css).
 */
const FILL_OVERRIDES = new Map([['destructive-foreground', 'destructive-surface']])

const pairs = []
for (const role of roles) {
  if (role.endsWith('-foreground')) {
    const base = role.slice(0, -'-foreground'.length)
    const fill = FILL_OVERRIDES.get(role) ?? (roles.has(base) ? base : `${base}-surface`)
    if (roles.has(fill)) pairs.push([role, fill])
  } else if (role.endsWith('-text')) {
    const surface = `${role.slice(0, -'-text'.length)}-surface`
    if (roles.has(surface)) pairs.push([role, surface])
  }
}
for (const text of TEXT_ROLES) {
  for (const surface of SURFACES) pairs.push([text, surface])
}
pairs.push(...EXTRA_PAIRS)

const failures = []
const skipped = new Set()
let checked = 0
for (const theme of ['dark', 'light', 'dim']) {
  const lookup = themeLookup(themes, theme)
  for (const [fg, bg] of pairs) {
    if (EXEMPT.has(fg)) continue
    const fgValue = resolve(lookup, fg)
    const bgValue = resolve(lookup, bg)
    if (!fgValue || !bgValue) continue
    const fgRgb = parseHex(fgValue)
    const bgRgb = parseHex(bgValue)
    if (!fgRgb || !bgRgb) {
      skipped.add(`${fg} on ${bg}`)
      continue
    }
    checked += 1
    const ratio = contrast(fgRgb, bgRgb)
    if (ratio < AA_TEXT) {
      failures.push(`  [${theme}] ${fg} (${fgValue}) on ${bg} (${bgValue}): ${ratio.toFixed(2)}:1`)
    }
  }
}

if (failures.length > 0) {
  console.error(`✗ token contrast: ${failures.length} pair(s) below ${AA_TEXT}:1`)
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(
  `✅ token contrast: ${checked} pair(s) at or above ${AA_TEXT}:1 in dark, light and dim` +
    (skipped.size > 0 ? `; ${skipped.size} translucent pair(s) skipped` : ''),
)
